import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/<YOUR_INFURA_PROJECT_ID>",
      accounts: ["<YOUR_PRIVATE_KEY>"] // add later
    }
  }
};

export default config;
