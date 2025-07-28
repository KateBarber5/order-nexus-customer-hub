# Environment Configuration

## API Endpoint Configuration

The application now uses a configurable API endpoint that can be set for different environments.

### Configuration File
The API endpoint is configured in `src/config/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://order.govmetric.ai';
```

### Environment Variables

You can set the API endpoint using the `VITE_API_BASE_URL` environment variable:

#### For Development (Local Development Server)
```bash
VITE_API_BASE_URL=http://localhost:8080
```

#### For Production (Azure Deployment)
```bash
VITE_API_BASE_URL=https://order.govmetric.ai
```

### How to Change the API Endpoint

1. **For Development**: Create a `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

2. **For Production**: The default value `https://order.govmetric.ai` will be used when deployed to Azure.

3. **To change the production endpoint**: Update the default value in `src/config/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-new-api-endpoint.com';
   ```

### Available Endpoints

All API endpoints are now centralized in the configuration:

- Login: `/GovMetricAPI/GovmetricLogin`
- Get Orders: `/GovMetricAPI/GetOrders`
- Get Places: `/GovMetricAPI/GetPlaces`
- Check Municipality by Parcel: `/GovMetricAPI/CheckMunicipalityAvailabilityByParcel`
- Check Municipality by Address: `/GovMetricAPI/CheckMunicipalityAvailabilityByAddress`
- CRUD County: `/GovMetricAPI/CrudCounty`
- CRUD Municipality: `/GovMetricAPI/CrudMunicipality`
- Get Organizations: `/GovMetricAPI/GetOrganizations`
- Submit Report Request by Parcel: `/GovMetricAPI/PostReportRequestByParcel`
- Submit Report Request by Address: `/GovMetricAPI/PostReportRequestByAddress`
- Get All Available Services: `/GovMetricAPI/GetAllAvailableServices`
- Get Admin Order Reporting: `/GovMetricAPI/GetAdminOrderReporting`
- CRUD Account: `/GovMetricAPI/CrudAccount`
- Get System Parameter: `/GovMetricAPI/GetSystemParameter`
- Get User Profile: `/GovMetricAPI/GetUserProfile`
- Change Password: `/GovMetricAPI/PostChangePassword`

### Benefits

1. **Centralized Configuration**: All API endpoints are defined in one place
2. **Environment Flexibility**: Easy to switch between development and production
3. **No Rewrite Rules**: Direct API calls without relying on Azure Static Web Apps rewrite rules
4. **Better Error Handling**: More detailed logging and error messages
5. **Type Safety**: TypeScript interfaces for all API responses