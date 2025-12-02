// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MockTokens.sol";

contract MockTokensTest is Test {
    MockUSDC usdc;
    MockGold gold;

    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        usdc = new MockUSDC();
        gold = new MockGold();
    }

    function testMintUSDC() public {
        vm.prank(alice);
        usdc.mint(alice, 1000 * 1e6);
        
        assertEq(usdc.balanceOf(alice), 1000 * 1e6);
        console.log("Alice USDC Balance:", usdc.balanceOf(alice));
    }

    function testMintGold() public {
        vm.prank(bob);
        gold.mint(bob, 5 * 1e18);

        assertEq(gold.balanceOf(bob), 5 * 1e18);
        console.log("Bob Gold Balance:", gold.balanceOf(bob));
    }

    function testBurnGold() public {
        // 1. Mint first
        gold.mint(alice, 10 * 1e18);
        assertEq(gold.balanceOf(alice), 10 * 1e18);

        // 2. Burn
        vm.prank(alice);
        // Warning: The current MockGold implementation allows burning from anyone if not restricted
        // But here we verify standard usage (burn own)
        gold.burn(alice, 4 * 1e18);

        assertEq(gold.balanceOf(alice), 6 * 1e18);
        console.log("Alice Gold Balance after burn:", gold.balanceOf(alice));
    }
}
