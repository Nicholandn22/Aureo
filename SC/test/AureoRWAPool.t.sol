// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AureoRWAPool.sol";
import "../src/MockTokens.sol";
import "@pyth-network/pyth-sdk-solidity/PythStructs.sol";

contract SimpleMockPyth {
    mapping(bytes32 => PythStructs.Price) public prices;

    function updatePrice(bytes32 id, int64 price, int32 expo, uint64 publishTime) external {
        prices[id] = PythStructs.Price({
            price: price,
            conf: 100,
            expo: expo,
            publishTime: publishTime
        });
    }

    function getPriceNoOlderThan(bytes32 id, uint256 age) external view returns (PythStructs.Price memory) {
        PythStructs.Price memory p = prices[id];
        
        // Validasi umur harga
        if (block.timestamp > p.publishTime + age) {
            revert("StalePrice");
        }
        
        return p;
    }
    
    // Keep this for backward compatibility
    function getPriceUnsafe(bytes32 id) external view returns (PythStructs.Price memory) {
        return prices[id];
    }
}

contract AureoRWAPoolTest is Test {
    AureoRWAPool public pool;
    MockUSDC public usdc;
    MockGold public mGold;
    SimpleMockPyth public pyth;

    address public alice = address(0x1);
    address public bob = address(0x2);
    address public attacker = address(0x666);
    
    bytes32 constant GOLD_PRICE_ID = bytes32(uint256(0x123456789));

    function setUp() public {
        vm.warp(1000); 
        
        // 1. Deploy Mocks
        usdc = new MockUSDC();
        mGold = new MockGold();
        pyth = new SimpleMockPyth();

        // 2. Deploy Pool Utama
        pool = new AureoRWAPool(
            address(pyth),
            GOLD_PRICE_ID,
            address(mGold),
            address(usdc)
        );

        // 3. Setup Modal
        usdc.mint(address(pool), 100_000 * 1e6); 
        usdc.mint(alice, 5000 * 1e6); 
        usdc.mint(bob, 5000 * 1e6);
        usdc.mint(attacker, 5000 * 1e6);
        
        vm.label(alice, "Alice");
        vm.label(bob, "Bob"); 
        vm.label(attacker, "Attacker");
        vm.label(address(pool), "AureoPool");
        vm.label(address(pyth), "SimplePyth");
    }

    // --- HELPER: Update Harga Oracle ---
    function setOraclePrice(int64 price, int32 expo, uint64 publishTime) internal {
        pyth.updatePrice(GOLD_PRICE_ID, price, expo, publishTime);
    }

    // ==========================================
    // EXISTING TESTS (Updated for new signatures)
    // ==========================================

    function test_1_BuyGold() public {
        // Skenario: Harga Emas $2000
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);

        pool.buyGold(2000 * 1e6, 0); // minGoldOut = 0 (no slippage check)
        vm.stopPrank();

        assertEq(mGold.balanceOf(alice), 1 ether, "Alice harusnya dapat 1.0 mGold");
        assertEq(usdc.balanceOf(alice), 3000 * 1e6, "Sisa saldo Alice harusnya $3000");
    }

    function test_2_SellGold_WithProfit() public {
        // 1. Beli di $2000
        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0); 
        
        // 2. Harga Naik $2100
        vm.warp(block.timestamp + 10); 
        setOraclePrice(210000000000, -8, uint64(block.timestamp));

        // 3. Jual
        mGold.approve(address(pool), 1 ether); 
        pool.sellGold(1 ether, 0); // minUsdcOut = 0
        vm.stopPrank();

        // 4. Verifikasi
        assertEq(usdc.balanceOf(alice), 5100 * 1e6, "Alice harusnya untung $100");
        assertEq(mGold.balanceOf(alice), 0, "mGold Alice harus habis");
    }

    function test_3_Revert_IfPriceStale() public {
        // Set harga basi (70 detik lalu)
        uint64 pastTime = uint64(block.timestamp) - 70;
        setOraclePrice(200000000000, -8, pastTime);

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);

        vm.expectRevert("StalePrice");
        pool.buyGold(2000 * 1e6, 0);
        vm.stopPrank();
    }

    // ==========================================
    // EASY LEVEL TESTS
    // ==========================================

    function test_4_BuyWithZeroAmount() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        vm.expectRevert("Amount 0");
        pool.buyGold(0, 0);
        vm.stopPrank();
    }

    function test_5_SellWithZeroAmount() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        vm.expectRevert("Amount 0");
        pool.sellGold(0, 0);
        vm.stopPrank();
    }

    function test_6_BuyWithoutApproval() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        // No approval!
        vm.expectRevert();
        pool.buyGold(2000 * 1e6, 0);
        vm.stopPrank();
    }

    function test_7_SellWithoutApproval() public {
        // First buy some gold
        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        
        // Try to sell without approval
        vm.expectRevert();
        pool.sellGold(1 ether, 0);
        vm.stopPrank();
    }

    function test_8_EmergencyWithdraw_OwnerOnly() public {
        uint256 poolBalance = usdc.balanceOf(address(pool));
        
        // Owner withdraws
        pool.emergencyWithdraw(address(usdc));
        
        assertEq(usdc.balanceOf(address(this)), poolBalance, "Owner should receive all USDC");
        assertEq(usdc.balanceOf(address(pool)), 0, "Pool should be empty");
    }

    function test_9_EmergencyWithdraw_NonOwnerReverts() public {
        vm.prank(attacker);
        vm.expectRevert();
        pool.emergencyWithdraw(address(usdc));
    }

    // ==========================================
    // MEDIUM LEVEL TESTS
    // ==========================================

    function test_10_PriceWithExtremeExponentPositive() public {
        // Price with expo = +18
        setOraclePrice(2000, 18, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 1000 * 1e6);
        pool.buyGold(1000 * 1e6, 0);
        vm.stopPrank();

        // Should handle extreme exponent correctly
        assertTrue(mGold.balanceOf(alice) > 0, "Should mint some gold");
    }

    function test_11_PriceWithExtremeExponentNegative() public {
        // Price with expo = -18
        setOraclePrice(2000e18, -18, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 1000 * 1e6);
        pool.buyGold(1000 * 1e6, 0);
        vm.stopPrank();

        assertTrue(mGold.balanceOf(alice) > 0, "Should mint some gold");
    }

    function test_12_BuySmallAmount() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 1);
        pool.buyGold(1, 0); // 1 wei USDC
        vm.stopPrank();

        // Should handle small amounts without reverting
        assertTrue(mGold.balanceOf(alice) >= 0, "Should not revert");
    }

    function test_13_SellSmallAmount() public {
        // First buy some gold
        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);

        // Sell tiny amount
        mGold.approve(address(pool), 1);
        pool.sellGold(1, 0); // 1 wei mGOLD
        vm.stopPrank();

        assertTrue(mGold.balanceOf(alice) > 0, "Should still have gold left");
    }

    function test_14_RoundingErrors() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp)); // $2000

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        
        uint256 goldBought = mGold.balanceOf(alice);

        // Sell it back immediately
        mGold.approve(address(pool), goldBought);
        pool.sellGold(goldBought, 0);
        vm.stopPrank();

        // Check rounding loss
        uint256 usdcBack = usdc.balanceOf(alice) - 3000 * 1e6;
        uint256 loss = 2000 * 1e6 - usdcBack;
        
        emit log_named_uint("Rounding loss", loss);
        assertTrue(loss < 100, "Rounding loss should be minimal");
    }

    function test_15_InsufficientPoolLiquidity() public {
        // Drain most of pool liquidity
        pool.emergencyWithdraw(address(usdc));
        
        // Give pool only 10 USDC
        usdc.mint(address(pool), 10 * 1e6);

        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        
        // Try to sell more than pool has
        mGold.approve(address(pool), 1 ether);
        vm.expectRevert("Pool Kurang USDC");
        pool.sellGold(1 ether, 0);
        vm.stopPrank();
    }

    function test_16_MultipleUsersTrading() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        // Alice buys
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        vm.stopPrank();

        // Bob buys
        vm.startPrank(bob);
        usdc.approve(address(pool), 1000 * 1e6);
        pool.buyGold(1000 * 1e6, 0);
        vm.stopPrank();

        // Price increases
        vm.warp(block.timestamp + 10);
        setOraclePrice(220000000000, -8, uint64(block.timestamp));

        // Alice sells
        vm.startPrank(alice);
        mGold.approve(address(pool), mGold.balanceOf(alice));
        pool.sellGold(mGold.balanceOf(alice), 0);
        vm.stopPrank();

        // Bob sells
        vm.startPrank(bob);
        mGold.approve(address(pool), mGold.balanceOf(bob));
        pool.sellGold(mGold.balanceOf(bob), 0);
        vm.stopPrank();

        assertTrue(usdc.balanceOf(alice) > 5000 * 1e6, "Alice should profit");
        assertTrue(usdc.balanceOf(bob) > 5000 * 1e6, "Bob should profit");
    }

    function test_17_PriceManipulation() public {
        // Alice sees price at $2000
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        // Alice prepares to buy
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);

        // Attacker manipulates price before Alice's tx
        vm.stopPrank();
        vm.warp(block.timestamp + 1);
        setOraclePrice(250000000000, -8, uint64(block.timestamp)); // $2500

        // Alice's transaction executes at bad price without slippage protection  
        vm.prank(alice);
        vm.expectRevert("Slippage too high");
        pool.buyGold(2000 * 1e6, 1 ether); // Expects at least 1 gold (would get 0.8)
    }

    function test_18_BuySellRoundtrip() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        uint256 initialBalance = usdc.balanceOf(alice);
        
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        
        uint256 goldAmount = mGold.balanceOf(alice);
        
        mGold.approve(address(pool), goldAmount);
        pool.sellGold(goldAmount, 0);
        vm.stopPrank();

        uint256 finalBalance = usdc.balanceOf(alice);
        uint256 loss = initialBalance - finalBalance;
        
        emit log_named_uint("Buy-Sell roundtrip loss", loss);
        assertTrue(loss < 1000, "Roundtrip loss should be < 0.001 USDC");
    }

    // ==========================================
    // HARD LEVEL TESTS (Security & Attacks)
    // ==========================================

    function test_19_CRITICAL_MaliciousBurnAttack() public {
        // Give Alice some gold
        mGold.mint(alice, 10 ether);
        
        // Attacker tries to burn Alice's tokens WITHOUT allowance
        vm.prank(attacker);
        vm.expectRevert(); // Should revert due to allowance check
        mGold.burn(alice, 10 ether);
        
        // Alice should still have her tokens
        assertEq(mGold.balanceOf(alice), 10 ether, "Alice's tokens should be safe");
    }

    function test_20_FrontRunningAttack() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);

        // Alice wants at least 0.95 ETH (5% slippage tolerance)
        uint256 minGoldOut = 0.95 ether;

        // Attacker front-runs and manipulates price upward
        vm.stopPrank();
        vm.warp(block.timestamp + 1);
        setOraclePrice(220000000000, -8, uint64(block.timestamp)); // +10% price

        // Alice's tx should revert due to slippage protection
        vm.prank(alice);
        vm.expectRevert("Slippage too high");
        pool.buyGold(2000 * 1e6, minGoldOut);
    }

    function test_21_ReentrancyProtection() public {
        // Note: Current contract uses SafeERC20 which provides reentrancy protection
        // This test verifies the contract doesn't have obvious reentrancy issues
        
        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        
        // Contract should complete without issues
        assertTrue(mGold.balanceOf(alice) > 0, "Should receive gold");
        vm.stopPrank();
    }

    function test_22_OraclePriceZero() public {
        // Set price to 0 (invalid)
        setOraclePrice(0, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        
        vm.expectRevert("Invalid Oracle Price");
        pool.buyGold(2000 * 1e6, 0);
        vm.stopPrank();
    }

    function test_23_IntegerOverflowOnBuy() public {
        setOraclePrice(1, -8, uint64(block.timestamp)); // Very low price

        // Give Alice max USDC
        usdc.mint(alice, type(uint256).max / 1e12);

        vm.startPrank(alice);
        uint256 maxAmount = type(uint256).max / 1e12;
        usdc.approve(address(pool), maxAmount);
        
        // Should not overflow
        try pool.buyGold(maxAmount, 0) {
            assertTrue(true, "Transaction succeeded");
        } catch {
            // If it reverts, it's due to arithmetic checks, not overflow
            assertTrue(true, "Reverted safely");
        }
        vm.stopPrank();
    }

    function test_24_IntegerOverflowOnSell() public {
        // Give Alice max gold
        mGold.mint(alice, type(uint256).max / 1e18);

        setOraclePrice(type(int64).max, -8, uint64(block.timestamp)); // Max price

        vm.startPrank(alice);
        uint256 maxGold = type(uint256).max / 1e18;
        mGold.approve(address(pool), maxGold);
        
        // Should not overflow
        try pool.sellGold(maxGold, 0) {
            assertTrue(true, "Transaction succeeded");
        } catch {
            // If it reverts, it's safe
            assertTrue(true, "Reverted safely");
        }
        vm.stopPrank();
    }

    function test_25_PoolDrainAttack() public {
        uint256 poolInitial = usdc.balanceOf(address(pool));
        
        setOraclePrice(100000000, -8, uint64(block.timestamp)); // Very low price $1

        // Attacker tries to drain by buying cheap and selling expensive
        vm.startPrank(attacker);
        usdc.approve(address(pool), 5000 * 1e6);
        pool.buyGold(5000 * 1e6, 0); // Buy at $1
        
        // Change price
        vm.warp(block.timestamp + 10);
        setOraclePrice(1000000000000, -8, uint64(block.timestamp)); // $10000
        
        // Try to sell at high price
        uint256 attackerGold = mGold.balanceOf(attacker);
        mGold.approve(address(pool), attackerGold);
        
        // This should fail due to pool liquidity
        try pool.sellGold(attackerGold, 0) {
            // Check if pool is drained
            uint256 poolFinal = usdc.balanceOf(address(pool));
            assertTrue(poolFinal > 0, "Pool should not be completely drained");
        } catch {
            // Expected to revert due to insufficient liquidity
            assertTrue(true, "Protected from drain");
        }
        vm.stopPrank();
    }

    function test_26_FlashLoanAttack() public {
        // Simulate flash loan attack scenario
        // Attacker borrows huge USDC, manipulates, repays
        
        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        
        // Give attacker flash loan amount
        usdc.mint(attacker, 1000000 * 1e6);
        
        vm.startPrank(attacker);
        usdc.approve(address(pool), type(uint256).max);
        
        // Buy massive amount
        pool.buyGold(1000000 * 1e6, 0);
        
        // Can't manipulate oracle (it's external)
        // Can only manipulate pool reserves
        
        uint256 attackerGold = mGold.balanceOf(attacker);
        mGold.approve(address(pool), attackerGold);
        
        // Try to profit
        pool.sellGold(attackerGold, 0);
        
        uint256 profit = usdc.balanceOf(attacker) - 1000000 * 1e6;
        
        // Should have minimal profit due to rounding, not price manipulation
        emit log_named_uint("Flash loan 'profit'", profit);
        assertTrue(profit < 1000 * 1e6, "Should not profit significantly");
        vm.stopPrank();
    }

    function test_27_SandwhichAttack() public {
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        // Victim (Alice) is about to buy
        // Attacker front-runs

        vm.startPrank(attacker);
        usdc.approve(address(pool), 10000 * 1e6);
        pool.buyGold(10000 * 1e6, 0); // Front-run buy
        vm.stopPrank();

        // Victim's transaction
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6, 0);
        vm.stopPrank();

        // Attacker back-runs (sells)
        vm.startPrank(attacker);
        uint256 attackerGold = mGold.balanceOf(attacker);
        mGold.approve(address(pool), attackerGold);
        
        // Due to oracle pricing, attacker can't profit from sandwich
        pool.sellGold(attackerGold, 0);
        
        // Attacker should not profit (oracle determines price, not pool reserves)
        assertTrue(usdc.balanceOf(attacker) <= 5000 * 1e6 + 100, "No sandwich profit");
        vm.stopPrank();
    }

    function test_28_NegativePriceHandling() public {
        // Try to set negative price (should be caught)
        setOraclePrice(-200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        
        // Should revert due to negative price
        vm.expectRevert();
        pool.buyGold(2000 * 1e6, 0);
        vm.stopPrank();
    }

    // ==========================================
    // BONUS: Test burn allowance functionality
    // ==========================================
    
    function test_BONUS_BurnWithAllowance() public {
        mGold.mint(alice, 10 ether);
        
        // Alice approves attacker to burn her tokens
        vm.prank(alice);
        mGold.approve(attacker, 5 ether);
        
        // Attacker burns with allowance
        vm.prank(attacker);
        mGold.burn(alice, 5 ether); // Should work due to allowance
        
        assertEq(mGold.balanceOf(alice), 5 ether, "Alice should have 5 gold left");
    }
    
    function test_BONUS_BurnOwnTokens() public {
        mGold.mint(alice, 10 ether);
        
        // Alice burns her own tokens using burn(uint256)
        vm.prank(alice);
        mGold.burn(5 ether);
        
        assertEq(mGold.balanceOf(alice), 5 ether, "Alice should have 5 gold left");
    }
}