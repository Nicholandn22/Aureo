// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AureoRWAPool.sol";
import "../src/MockTokens.sol";
import "@pyth-network/pyth-sdk-solidity/PythStructs.sol";
// Kita tidak pakai MockPyth bawaan karena ribet/error, kita buat sendiri yang simple.

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
        
        // Simulasi validasi umur harga
        // Jika publishTime + age < block.timestamp, maka stale
        if (block.timestamp > p.publishTime + age) {
            revert("StalePrice");
        }
        
        return p;
    }
}

contract AureoRWAPoolTest is Test {
    AureoRWAPool public pool;
    MockUSDC public usdc;
    MockGold public mGold;
    SimpleMockPyth public pyth;

    address public alice = address(0x1);
    
    bytes32 constant GOLD_PRICE_ID = bytes32(uint256(0x123456789));

    function setUp() public {
        vm.warp(1000); 
        
        // 1. Deploy Mocks
        usdc = new MockUSDC();
        mGold = new MockGold();
        pyth = new SimpleMockPyth(); // Pakai Mock Sendiri

        // 2. Deploy Pool Utama
        pool = new AureoRWAPool(
            address(pyth),
            GOLD_PRICE_ID,
            address(mGold),
            address(usdc)
        );

        // 3. Setup Permissions
        mGold.grantRole(mGold.MINTER_ROLE(), address(pool));

        // 4. Setup Modal
        usdc.mint(address(pool), 100_000 * 1e6); 
        usdc.mint(alice, 5000 * 1e6); 
        
        vm.label(alice, "Alice");
        vm.label(address(pool), "AureoPool");
        vm.label(address(pyth), "SimplePyth");
    }

    // --- HELPER: Update Harga Oracle ---
    function setOraclePrice(int64 price, int32 expo, uint64 publishTime) internal {
        pyth.updatePrice(GOLD_PRICE_ID, price, expo, publishTime);
    }

    // ==========================================
    // TEST CASES
    // ==========================================

    function test_1_BuyGold() public {
        // Skenario: Harga Emas $2000
        setOraclePrice(200000000000, -8, uint64(block.timestamp));

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);

        pool.buyGold(2000 * 1e6);
        vm.stopPrank();

        assertEq(mGold.balanceOf(alice), 1 ether, "Alice harusnya dapat 1.0 mGold");
        assertEq(usdc.balanceOf(alice), 3000 * 1e6, "Sisa saldo Alice harusnya $3000");
    }

    function test_2_SellGold_WithProfit() public {
        // 1. Beli di $2000
        setOraclePrice(200000000000, -8, uint64(block.timestamp));
        
        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);
        pool.buyGold(2000 * 1e6); 
        
        // 2. Harga Naik $2100
        vm.warp(block.timestamp + 10); 
        setOraclePrice(210000000000, -8, uint64(block.timestamp));

        // 3. Jual
        mGold.approve(address(pool), 1 ether); 
        pool.sellGold(1 ether);
        vm.stopPrank();

        // 4. Verifikasi
        // Modal Awal $5000 - $2000 + $2100 = $5100
        assertEq(usdc.balanceOf(alice), 5100 * 1e6, "Alice harusnya untung $100");
        assertEq(mGold.balanceOf(alice), 0, "mGold Alice harus habis");
    }

    function test_3_Revert_IfPriceStale() public {
        // Set harga basi (70 detik lalu)
        uint64 pastTime = uint64(block.timestamp) - 70;
        setOraclePrice(200000000000, -8, pastTime);

        vm.startPrank(alice);
        usdc.approve(address(pool), 2000 * 1e6);

        vm.expectRevert("StalePrice"); // Expect error string dari SimpleMockPyth
        pool.buyGold(2000 * 1e6);
        vm.stopPrank();
    }
}