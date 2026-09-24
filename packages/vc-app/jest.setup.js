// Módulos nativos que não existem no Jest: usa os mocks oficiais.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
