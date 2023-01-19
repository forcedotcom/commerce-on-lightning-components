// Force JEST to use the mock connectors
// Must be outside of the __mock__ folder to please Lint
jest.mock('../appContextDataSource');
jest.mock('../sessionContextDataSource');
jest.mock('../einsteinContextDataSource');

export { mockAppContextData, mockSessionContextData, mockEinsteinContextData } from './mockData';
