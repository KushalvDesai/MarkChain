import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GradingSSIModule = buildModule("GradingSSIModule", (m) => {
  // No constructor arguments for GradingSSI, but you can pass them here if needed
  const gradingSSI = m.contract("GradingSSI");

  return { gradingSSI };
});

export default GradingSSIModule;
