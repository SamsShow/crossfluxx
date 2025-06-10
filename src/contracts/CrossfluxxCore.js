[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_healthChecker",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_ccipModule",
				"type": "address"
			}
		],
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
		"name": "InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InsufficientDeposit",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidInterval",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidThreshold",
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
		"name": "RebalanceOnCooldown",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "UnauthorizedToken",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "VaultNotActive",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newTotal",
				"type": "uint256"
			}
		],
		"name": "DepositAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "EmergencyWithdrawal",
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
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "newThresholds",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newInterval",
				"type": "uint256"
			}
		],
		"name": "ParametersUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fromChain",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "toChain",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "targetPool",
				"type": "address"
			}
		],
		"name": "RebalanceExecuted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "RebalanceTriggered",
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
				"indexed": false,
				"internalType": "bool",
				"name": "authorized",
				"type": "bool"
			}
		],
		"name": "TokenAuthorized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "preferredChains",
				"type": "uint256[]"
			}
		],
		"name": "VaultCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "chainId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newApy",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tvl",
				"type": "uint256"
			}
		],
		"name": "YieldDataUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "MAX_THRESHOLD",
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
		"name": "MIN_DEPOSIT",
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
		"name": "MIN_REBALANCE_INTERVAL",
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
		"name": "SAFETY_BUFFER",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedTokens",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ccipModule",
		"outputs": [
			{
				"internalType": "contract CCIPModule",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "chainYieldData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "chainId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "poolAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "currentApy",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tvl",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdated",
				"type": "uint256"
			},
			{
				"internalType": "contract AggregatorV3Interface",
				"name": "priceFeed",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "checkUpkeep",
		"outputs": [
			{
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "performData",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "_preferredChains",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_apyThresholds",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "_rebalanceInterval",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_chainId",
				"type": "uint256"
			}
		],
		"name": "getChainYieldData",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "chainId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "poolAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "currentApy",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "tvl",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastUpdated",
						"type": "uint256"
					},
					{
						"internalType": "contract AggregatorV3Interface",
						"name": "priceFeed",
						"type": "address"
					}
				],
				"internalType": "struct CrossfluxxCore.ChainYieldData",
				"name": "yieldData",
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
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserVault",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "totalDeposited",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastRebalanceTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256[]",
						"name": "preferredChains",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256[]",
						"name": "apyThresholds",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256",
						"name": "rebalanceInterval",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct CrossfluxxCore.UserVault",
				"name": "vault",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "healthChecker",
		"outputs": [
			{
				"internalType": "contract HealthChecker",
				"name": "",
				"type": "address"
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
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
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
				"name": "_user",
				"type": "address"
			},
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "fromChain",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "toChain",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "targetPool",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "expectedApy",
						"type": "uint256"
					}
				],
				"internalType": "struct CrossfluxxCore.RebalanceParams[]",
				"name": "_rebalanceParams",
				"type": "tuple[]"
			}
		],
		"name": "performRebalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "_performData",
				"type": "bytes"
			}
		],
		"name": "performUpkeep",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_authorized",
				"type": "bool"
			}
		],
		"name": "setTokenAuthorization",
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
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[]",
				"name": "_apyThresholds",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "_rebalanceInterval",
				"type": "uint256"
			}
		],
		"name": "updateParameters",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_chainId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_poolAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_apy",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tvl",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_priceFeed",
				"type": "address"
			}
		],
		"name": "updateYieldData",
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
		"name": "userVaults",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalDeposited",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastRebalanceTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rebalanceInterval",
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
	}
]