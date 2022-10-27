import { defineConfig } from 'cypress';

// Port the application is running on.
var port = 4200;
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:' + port,
    supportFile: false,
    viewportHeight: 900,
    viewportWidth: 1400
  }
})