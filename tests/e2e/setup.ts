import { beforeAll, afterAll, beforeEach } from "vitest";
import { fetchMock } from "./mocks/fetch";
import { MockBlockchainAPI } from "./mocks/blockchain";
import { testDataProvider } from "./data/testData";

// Global test infrastructure
let mockBlockchain: MockBlockchainAPI;

beforeAll(async () => {
  // Initialize test data first
  await testDataProvider.initialize();

  // Install unified fetch mock
  fetchMock.install();

  // Initialize blockchain mocks
  mockBlockchain = new MockBlockchainAPI();
  await mockBlockchain.start();

  console.log("E2E Test infrastructure started");
});

afterAll(async () => {
  // Clean up mock services
  fetchMock.uninstall();
  await mockBlockchain.stop();

  console.log("E2E Test infrastructure stopped");
});

beforeEach(async () => {
  // Reset mock state before each test
  mockBlockchain.reset();
});

// Export for use in tests
export { mockBlockchain };