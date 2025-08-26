import express from 'express';

// A placeholder function that can be replaced with actual Sentry implementation later
export const initializeSentry = (app: express.Application) => {
  console.log('Sentry integration is not configured yet');
  
  // Return a no-op error handler
  return (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Just pass to the next error handler
    next(err);
  };
};
//       ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
//     ],
//     tracesSampleRate: 1.0,
//   });

//   // The request handler must be the first middleware on the app
//   app.use(Sentry.Handlers.requestHandler());
  
//   // TracingHandler creates a trace for every incoming request
//   app.use(Sentry.Handlers.tracingHandler());
  
//   // Return Sentry error handler for use after all controllers
//   return Sentry.Handlers.errorHandler();
// };
