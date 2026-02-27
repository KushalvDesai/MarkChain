// GradingSSI Smart Contract Configuration for Sepolia Testnet

export const GRADING_SSI_CONTRACT_ADDRESS = '0x4179C3173DA7B8241C292d086c44d9528a3AD437';

// Minimal ABI — only the functions we call from the frontend
export const GRADING_SSI_ABI = [
    {
        name: 'createSubject',
        type: 'function',
        inputs: [
            {
                name: 'subject',
                type: 'string',
                internalType: 'string',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;
