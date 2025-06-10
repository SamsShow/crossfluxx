// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title HealthChecker
 * @notice Verifies vault collateral health using Chainlink Proof of Reserves
 * @dev Integrates with Chainlink PoR oracles to ensure vaults maintain required collateral
 */
contract HealthChecker is Ownable, ReentrancyGuard {
    
    // Structs
    struct VaultHealth {
        uint256 totalCollateral;
        uint256 requiredCollateral;
        uint256 lastCheckTimestamp;
        bool isHealthy;
        uint256 healthRatio; // Basis points (10000 = 100%)
    }

    struct ProofOfReservesConfig {
        AggregatorV3Interface porOracle;
        uint256 minHealthRatio; // Minimum health ratio in basis points
        uint256 maxStaleness; // Maximum age of PoR data in seconds
        bool isActive;
    }

    // State variables
    mapping(address => VaultHealth) public vaultHealthData;
    mapping(address => ProofOfReservesConfig) public porConfigs; // token => config
    
    uint256 public constant DEFAULT_MIN_HEALTH_RATIO = 12000; // 120%
    uint256 public constant DEFAULT_MAX_STALENESS = 3600; // 1 hour
    uint256 public constant HEALTH_DECIMALS = 10000; // 100.00%
    
    // Events
    event HealthCheckPerformed(
        address indexed vault,
        uint256 totalCollateral,
        uint256 requiredCollateral,
        uint256 healthRatio,
        bool isHealthy
    );
    event ProofOfReservesConfigured(
        address indexed token,
        address indexed porOracle,
        uint256 minHealthRatio,
        uint256 maxStaleness
    );
    event VaultHealthUpdated(address indexed vault, uint256 newHealthRatio);
    event EmergencyHealthOverride(address indexed vault, bool overrideValue);

    // Errors
    error InvalidHealthRatio();
    error StaleProofOfReserves();
    error ProofOfReservesNotConfigured();
    error InsufficientCollateral();
    error HealthCheckFailed();

    /**
     * @notice Initialize the HealthChecker contract
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Configure Proof of Reserves oracle for a specific token
     * @param _token Token address to configure PoR for
     * @param _porOracle Chainlink PoR oracle address
     * @param _minHealthRatio Minimum health ratio in basis points
     * @param _maxStaleness Maximum staleness of PoR data in seconds
     */
    function configureProofOfReserves(
        address _token,
        address _porOracle,
        uint256 _minHealthRatio,
        uint256 _maxStaleness
    ) external onlyOwner {
        if (_minHealthRatio < 10000) revert InvalidHealthRatio(); // Must be at least 100%
        
        porConfigs[_token] = ProofOfReservesConfig({
            porOracle: AggregatorV3Interface(_porOracle),
            minHealthRatio: _minHealthRatio,
            maxStaleness: _maxStaleness,
            isActive: true
        });
        
        emit ProofOfReservesConfigured(_token, _porOracle, _minHealthRatio, _maxStaleness);
    }

    /**
     * @notice Verify vault collateral health
     * @param _vault Vault address to check
     * @param _requiredAmount Required collateral amount
     * @return isHealthy Whether the vault passes health checks
     */
    function verifyCollateral(
        address _vault,
        uint256 _requiredAmount
    ) external returns (bool isHealthy) {
        return _performHealthCheck(_vault, _requiredAmount);
    }

    /**
     * @notice Get vault health data (view function)
     * @param _vault Vault address
     * @param _requiredAmount Required collateral amount
     * @return isHealthy Whether vault is healthy
     * @return healthRatio Current health ratio in basis points
     * @return totalCollateral Total collateral in the vault
     */
    function getVaultHealth(
        address _vault,
        uint256 _requiredAmount
    ) external view returns (
        bool isHealthy,
        uint256 healthRatio,
        uint256 totalCollateral
    ) {
        return _calculateHealth(_vault, _requiredAmount);
    }

    /**
     * @notice Internal function to perform comprehensive health check
     * @param _vault Vault address to check
     * @param _requiredAmount Required collateral amount
     * @return isHealthy Whether the vault is healthy
     */
    function _performHealthCheck(
        address _vault,
        uint256 _requiredAmount
    ) internal returns (bool isHealthy) {
        
        (bool healthy, uint256 healthRatio, uint256 totalCollateral) = _calculateHealth(_vault, _requiredAmount);
        
        // Update vault health data
        vaultHealthData[_vault] = VaultHealth({
            totalCollateral: totalCollateral,
            requiredCollateral: _requiredAmount,
            lastCheckTimestamp: block.timestamp,
            isHealthy: healthy,
            healthRatio: healthRatio
        });
        
        emit HealthCheckPerformed(
            _vault,
            totalCollateral,
            _requiredAmount,
            healthRatio,
            healthy
        );
        
        return healthy;
    }

    /**
     * @notice Calculate vault health metrics
     * @param _vault Vault address
     * @param _requiredAmount Required collateral amount
     * @return isHealthy Whether vault meets health requirements
     * @return healthRatio Health ratio in basis points
     * @return totalCollateral Total collateral value
     */
    function _calculateHealth(
        address _vault,
        uint256 _requiredAmount
    ) internal view returns (
        bool isHealthy,
        uint256 healthRatio,
        uint256 totalCollateral
    ) {
        // This is a simplified implementation
        // In production, you would aggregate collateral across multiple tokens/chains
        
        // For this example, we'll assume the vault address maps to a collateral amount
        // In reality, you'd query the actual vault contract or use PoR oracles
        
        totalCollateral = _getVaultCollateralFromPoR(_vault);
        
        if (_requiredAmount == 0) {
            healthRatio = HEALTH_DECIMALS; // 100%
            isHealthy = true;
            return (isHealthy, healthRatio, totalCollateral);
        }
        
        healthRatio = (totalCollateral * HEALTH_DECIMALS) / _requiredAmount;
        isHealthy = healthRatio >= DEFAULT_MIN_HEALTH_RATIO;
        
        return (isHealthy, healthRatio, totalCollateral);
    }

    /**
     * @notice Get vault collateral from Proof of Reserves oracle
     * @param _vault Vault address
     * @return collateralAmount Total collateral amount from PoR
     */
    function _getVaultCollateralFromPoR(address _vault) internal view returns (uint256 collateralAmount) {
        // This is a simplified implementation
        // In production, you would have specific PoR oracles for different tokens/vaults
        
        // For demonstration, we'll use a default calculation
        // In reality, you'd iterate through configured PoR oracles
        
        return 1000000e18; // Placeholder - would be actual PoR query
    }

    /**
     * @notice Query Proof of Reserves oracle for specific token
     * @param _token Token address
     * @return reserves Current reserves amount
     * @return timestamp Last update timestamp
     */
    function getProofOfReserves(address _token) external view returns (
        uint256 reserves,
        uint256 timestamp
    ) {
        ProofOfReservesConfig memory config = porConfigs[_token];
        if (!config.isActive) revert ProofOfReservesNotConfigured();
        
        (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = config.porOracle.latestRoundData();
        
        // Check if data is fresh
        if (block.timestamp - updatedAt > config.maxStaleness) {
            revert StaleProofOfReserves();
        }
        
        reserves = uint256(answer);
        timestamp = updatedAt;
    }

    /**
     * @notice Check if vault can safely execute a withdrawal/rebalance
     * @param _vault Vault address
     * @param _withdrawalAmount Amount to be withdrawn
     * @param _currentBalance Current vault balance
     * @return canWithdraw Whether withdrawal is safe
     */
    function checkWithdrawalSafety(
        address _vault,
        uint256 _withdrawalAmount,
        uint256 _currentBalance
    ) external view returns (bool canWithdraw) {
        if (_withdrawalAmount > _currentBalance) {
            return false;
        }
        
        uint256 remainingBalance = _currentBalance - _withdrawalAmount;
        uint256 minRequiredBalance = (_currentBalance * DEFAULT_MIN_HEALTH_RATIO) / HEALTH_DECIMALS;
        
        return remainingBalance >= minRequiredBalance;
    }

    /**
     * @notice Batch health check for multiple vaults
     * @param _vaults Array of vault addresses
     * @param _requiredAmounts Array of required amounts for each vault
     * @return results Array of health check results
     */
    function batchHealthCheck(
        address[] calldata _vaults,
        uint256[] calldata _requiredAmounts
    ) external returns (bool[] memory results) {
        require(_vaults.length == _requiredAmounts.length, "Array length mismatch");
        
        results = new bool[](_vaults.length);
        
        for (uint256 i = 0; i < _vaults.length; i++) {
            results[i] = _performHealthCheck(_vaults[i], _requiredAmounts[i]);
        }
        
        return results;
    }

    /**
     * @notice Emergency function to override health status (Owner only)
     * @param _vault Vault address
     * @param _healthyOverride Override value for health status
     * @dev Should only be used in emergency situations
     */
    function emergencyHealthOverride(
        address _vault,
        bool _healthyOverride
    ) external onlyOwner {
        VaultHealth storage health = vaultHealthData[_vault];
        health.isHealthy = _healthyOverride;
        health.lastCheckTimestamp = block.timestamp;
        
        emit EmergencyHealthOverride(_vault, _healthyOverride);
    }

    /**
     * @notice Update minimum health ratio for a token (Owner only)
     * @param _token Token address
     * @param _newMinHealthRatio New minimum health ratio in basis points
     */
    function updateMinHealthRatio(
        address _token,
        uint256 _newMinHealthRatio
    ) external onlyOwner {
        if (_newMinHealthRatio < 10000) revert InvalidHealthRatio();
        
        ProofOfReservesConfig storage config = porConfigs[_token];
        config.minHealthRatio = _newMinHealthRatio;
    }

    /**
     * @notice Disable Proof of Reserves for a token (Owner only)
     * @param _token Token address
     */
    function disableProofOfReserves(address _token) external onlyOwner {
        porConfigs[_token].isActive = false;
    }

    /**
     * @notice Get the last health check data for a vault
     * @param _vault Vault address
     * @return health VaultHealth struct
     */
    function getLastHealthCheck(address _vault) external view returns (VaultHealth memory health) {
        return vaultHealthData[_vault];
    }

    /**
     * @notice Check if a token has active Proof of Reserves configuration
     * @param _token Token address
     * @return isConfigured Whether PoR is configured and active
     */
    function isProofOfReservesConfigured(address _token) external view returns (bool isConfigured) {
        return porConfigs[_token].isActive;
    }
} 