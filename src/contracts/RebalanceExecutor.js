[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_router",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "available",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "required",
				"type": "uint256"
			}
		],
		"name": "InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "router",
				"type": "address"
			}
		],
		"name": "InvalidRouter",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidSlippage",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "expectedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "actualAmount",
				"type": "uint256"
			}
		],
		"name": "SlippageExceeded",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "SwapFailed",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "UnauthorizedSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "pool",
				"type": "address"
			}
		],
		"name": "UnsupportedPool",
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
				"indexed": true,
				"internalType": "address",
				"name": "token",
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
				"name": "poolAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "lpToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "apy",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"name": "PoolConfigured",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "messageId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "targetPool",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountIn",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lpTokensReceived",
				"type": "uint256"
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
				"internalType": "address",
				"name": "tokenIn",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenOut",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountIn",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			}
		],
		"name": "SwapExecuted",
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
				"indexed": true,
				"internalType": "address",
				"name": "pool",
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
				"name": "lpTokens",
				"type": "uint256"
			}
		],
		"name": "YieldFarmingEntered",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "BASIS_POINTS",
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
				"name": "_tokenIn",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amountIn",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_targetPool",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_slippageTolerance",
				"type": "uint256"
			},
			{
				"components": [
					{
						"internalType": "address",
						"name": "poolAddress",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "lpToken",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "currentApy",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "bytes",
						"name": "swapCalldata",
						"type": "bytes"
					}
				],
				"internalType": "struct RebalanceExecutor.PoolInfo",
				"name": "_poolInfo",
				"type": "tuple"
			}
		],
		"name": "_performSwapAndStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lpTokens",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_sender",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_authorized",
				"type": "bool"
			}
		],
		"name": "authorizeCCIPSender",
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
		"name": "authorizedCCIPSenders",
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
				"components": [
					{
						"internalType": "bytes32",
						"name": "messageId",
						"type": "bytes32"
					},
					{
						"internalType": "uint64",
						"name": "sourceChainSelector",
						"type": "uint64"
					},
					{
						"internalType": "bytes",
						"name": "sender",
						"type": "bytes"
					},
					{
						"internalType": "bytes",
						"name": "data",
						"type": "bytes"
					},
					{
						"components": [
							{
								"internalType": "address",
								"name": "token",
								"type": "address"
							},
							{
								"internalType": "uint256",
								"name": "amount",
								"type": "uint256"
							}
						],
						"internalType": "struct Client.EVMTokenAmount[]",
						"name": "destTokenAmounts",
						"type": "tuple[]"
					}
				],
				"internalType": "struct Client.Any2EVMMessage",
				"name": "message",
				"type": "tuple"
			}
		],
		"name": "ccipReceive",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_poolAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_lpToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_apy",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "_swapCalldata",
				"type": "bytes"
			}
		],
		"name": "configurePool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "defaultSlippageTolerance",
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
				"name": "_poolAddress",
				"type": "address"
			}
		],
		"name": "disablePool",
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
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "emergencyRecoverToken",
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
				"name": "_amount",
				"type": "uint256"
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
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "executionResults",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "messageId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "targetPool",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountIn",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountOut",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lpTokensReceived",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "actualYield",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
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
				"internalType": "bytes32",
				"name": "_messageId",
				"type": "bytes32"
			}
		],
		"name": "getExecutionResult",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "messageId",
						"type": "bytes32"
					},
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "targetPool",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amountIn",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amountOut",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lpTokensReceived",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "actualYield",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "success",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct RebalanceExecutor.ExecutionResult",
				"name": "result",
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
				"name": "_poolAddress",
				"type": "address"
			}
		],
		"name": "getPoolInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "poolAddress",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "lpToken",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "currentApy",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "bytes",
						"name": "swapCalldata",
						"type": "bytes"
					}
				],
				"internalType": "struct RebalanceExecutor.PoolInfo",
				"name": "poolInfo",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRouter",
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
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "balance",
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
				"name": "_poolAddress",
				"type": "address"
			}
		],
		"name": "isPoolSupported",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isSupported",
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
				"name": "_ccipModule",
				"type": "address"
			}
		],
		"name": "setCCIPModule",
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
		"name": "supportedPools",
		"outputs": [
			{
				"internalType": "address",
				"name": "poolAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "lpToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "currentApy",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "swapCalldata",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
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
				"internalType": "uint256",
				"name": "_newSlippage",
				"type": "uint256"
			}
		],
		"name": "updateDefaultSlippage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_poolAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_newApy",
				"type": "uint256"
			}
		],
		"name": "updatePoolAPY",
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
		"name": "userBalances",
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
				"name": "_poolAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdrawFromPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]