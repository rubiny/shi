// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SHIT Staking
 * @notice Stake $SHIT tokens for APY rewards
 * @dev Lock periods: 7d (32% APY), 14d (40% APY), 30d (52% APY), 90d (67% APY)
 */
contract ShitStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable shitToken;

    struct Position {
        uint256 amount;
        uint256 lockDays;
        uint256 startedAt;
        uint256 claimedRewards;
        bool isUnstaked;
    }

    mapping(address => uint256[]) public userPositions;
    mapping(uint256 => Position) public positions;
    mapping(uint256 => uint256) public apyByLockDays; // lockDays => APY basis points (e.g., 3200 = 32%)

    uint256 public positionCounter;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 positionId, uint256 amount, uint256 lockDays);
    event Unstaked(address indexed user, uint256 positionId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 positionId, uint256 rewards);

    constructor(address _shitToken) Ownable(msg.sender) {
        shitToken = IERC20(_shitToken);

        // Default APY tiers (basis points)
        apyByLockDays[7] = 3200;   // 32%
        apyByLockDays[14] = 4000;  // 40%
        apyByLockDays[30] = 5200;  // 52%
        apyByLockDays[90] = 6700;  // 67%
    }

    function stake(uint256 amount, uint256 lockDays) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(apyByLockDays[lockDays] > 0, "Invalid lock period");

        shitToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 positionId = positionCounter++;
        positions[positionId] = Position({
            amount: amount,
            lockDays: lockDays,
            startedAt: block.timestamp,
            claimedRewards: 0,
            isUnstaked: false
        });
        userPositions[msg.sender].push(positionId);
        totalStaked += amount;

        emit Staked(msg.sender, positionId, amount, lockDays);
    }

    function unstake(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(!pos.isUnstaked, "Already unstaked");
        require(pos.amount > 0, "Position not found");
        require(block.timestamp >= pos.startedAt + (pos.lockDays * 1 days), "Lock period not ended");

        // Claim any remaining rewards first
        uint256 rewards = _calculateRewards(positionId);
        if (rewards > 0) {
            shitToken.safeTransfer(msg.sender, rewards);
            emit RewardsClaimed(msg.sender, positionId, rewards);
        }

        pos.isUnstaked = true;
        totalStaked -= pos.amount;
        shitToken.safeTransfer(msg.sender, pos.amount);

        emit Unstaked(msg.sender, positionId, pos.amount);
    }

    function claimRewards(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(!pos.isUnstaked, "Position unstaked");
        require(pos.amount > 0, "Position not found");

        uint256 rewards = _calculateRewards(positionId);
        require(rewards > 0, "No rewards to claim");

        pos.claimedRewards += rewards;
        shitToken.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, positionId, rewards);
    }

    function _calculateRewards(uint256 positionId) internal view returns (uint256) {
        Position storage pos = positions[positionId];
        uint256 elapsed = block.timestamp - pos.startedAt;
        uint256 apy = apyByLockDays[pos.lockDays];

        // rewards = amount * apy * elapsed / (365 days * 10000)
        uint256 totalRewards = (pos.amount * apy * elapsed) / (365 days * 10000);
        return totalRewards - pos.claimedRewards;
    }

    function getPosition(uint256 positionId) external view returns (
        uint256 amount, uint256 lockDays, uint256 startedAt, uint256 rewards, bool isUnstaked
    ) {
        Position storage pos = positions[positionId];
        return (pos.amount, pos.lockDays, pos.startedAt, _calculateRewards(positionId), pos.isUnstaked);
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getAPY(uint256 lockDays) external view returns (uint256) {
        return apyByLockDays[lockDays];
    }

    // Admin: set APY for a lock period
    function setAPY(uint256 lockDays, uint256 apyBasisPoints) external onlyOwner {
        apyByLockDays[lockDays] = apyBasisPoints;
    }

    // Admin: fund rewards pool
    function fundRewards(uint256 amount) external onlyOwner {
        shitToken.safeTransferFrom(msg.sender, address(this), amount);
    }
}
