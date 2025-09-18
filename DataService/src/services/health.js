class HealthService {
  // PUBLIC_INTERFACE
  getStatus() {
    /** Return health payload */
    return {
      status: 'ok',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

module.exports = new HealthService();
