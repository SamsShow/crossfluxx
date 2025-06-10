[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "HealthCheckFailed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InsufficientCollateral",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidHealthRatio",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ProofOfReservesNotConfigured",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "StaleProofOfReserves",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "vault",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "overrideValue",
				"type": "bool"
			}
		],
		"name": "EmergencyHealthOverride",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "vault",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalCollateral",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requiredCollateral",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "healthRatio",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isHealthy",
				"type": "bool"
			}
		],
		"name": "HealthCheckPerformed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "porOracle",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "minHealthRatio",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "maxStaleness",
				"type": "uint256"
			}
		],
		"name": "ProofOfReservesConfigured",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "vault",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newHealthRatio",
				"type": "uint256"
			}
		],
		"name": "VaultHealthUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEFAULT_MAX_STALENESS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DEFAULT_MIN_HEALTH_RATIO",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "HEALTH_DECIMALS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_vaults",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_requiredAmounts",
				"type": "uint256[]"
			}
		],
		"name": "batchHealthCheck",
		"outputs": [
			{
				"internalType": "bool[]",
				"name": "results",
				"type": "bool[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vault",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_withdrawalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_currentBalance",
				"type": "uint256"
			}
		],
		"name": "checkWithdrawalSafety",
		"outputs": [
			{
				"internalType": "bool",
				"name": "canWithdraw",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_porOracle",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_minHealthRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxStaleness",
				"type": "uint256"
			}
		],
		"name": "configureProofOfReserves",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "disableProofOfReserves",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vault",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_healthyOverride",
				"type": "bool"
			}
		],
		"name": "emergencyHealthOverride",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vault",
				"type": "address"
			}
		],
		"name": "getLastHealthCheck",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "totalCollateral",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "requiredCollateral",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastCheckTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isHealthy",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "healthRatio",
						"type": "uint256"
					}
				],
				"internalType": "struct HealthChecker.VaultHealth",
				"name": "health",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "getProofOfReserves",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "reserves",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vault",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_requiredAmount",
				"type": "uint256"
			}
		],
		"name": "getVaultHealth",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isHealthy",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "healthRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalCollateral",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "isProofOfReservesConfigured",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isConfigured",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "porConfigs",
		"outputs": [
			{
				"internalType": "contract AggregatorV3Interface",
				"name": "porOracle",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "minHealthRatio",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxStaleness",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_newMinHealthRatio",
				"type": "uint256"
			}
		],
		"name": "updateMinHealthRatio",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "vaultHealthData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalCollateral",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "requiredCollateral",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastCheckTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isHealthy",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "healthRatio",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vault",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_requiredAmount",
				"type": "uint256"
			}
		],
		"name": "verifyCollateral",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isHealthy",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]