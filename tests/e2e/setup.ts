import { beforeAll, afterAll, beforeEach } from "vitest";
import { httpEndpointMock } from "./mocks/fetch";
import { MockBlockchainAPI } from "./mocks/blockchain";
import { testDataProvider } from "./data/testData";

// Global test infrastructure
let mockBlockchain: MockBlockchainAPI;

beforeAll(async () => {
  // Initialize test data first
  await testDataProvider.initialize();

  // Install HTTP endpoint mock (intercepts actual API calls)
  httpEndpointMock.install();

  // Initialize blockchain mocks (for smart contract calls)
  mockBlockchain = new MockBlockchainAPI();
  await mockBlockchain.start();

  console.log("E2E Test infrastructure started - mocking actual HTTP endpoints");
});

afterAll(async () => {
  // Clean up mock services
  httpEndpointMock.uninstall();
  await mockBlockchain.stop();

  console.log("E2E Test infrastructure stopped");
});

beforeEach(async () => {
  // Reset mock state before each test
  mockBlockchain.reset();
});

// Export for use in tests
export { mockBlockchain };