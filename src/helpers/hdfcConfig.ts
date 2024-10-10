import { Juspay,APIError} from "expresscheckout-nodejs";
import * as fs from 'fs';
import * as path from 'path';

// Import JSON config file
import config from '../config.json';
import "dotenv/config";

/////
// Type definitions for the config object
interface Config {
    PUBLIC_KEY_PATH: string;
    PRIVATE_KEY_PATH: string;
    PAYMENT_PAGE_CLIENT_ID: string;
    MERCHANT_ID: string;
    KEY_UUID: string;
  }
  
  // Type assertion for config to ensure it matches our interface
  const typedConfig = config as Config;
  
  // Read public and private keys from file system
  const publicKey = fs.readFileSync(typedConfig.PUBLIC_KEY_PATH, 'utf8');
  const privateKey = fs.readFileSync(typedConfig.PRIVATE_KEY_PATH, 'utf8');
  
  // Use the PAYMENT_PAGE_CLIENT_ID for your operations
  const paymentPageClientId = typedConfig.PAYMENT_PAGE_CLIENT_ID;
  
  // Assuming Juspay is a class or library and should be imported
  // Example: import Juspay from 'juspay';  (Assuming Juspay is a package)
  // Uncomment the next line after installing the correct Juspay package
  // import Juspay from 'juspay';
  
  // Example Juspay constructor call (with TypeScript types)
  interface JuspayConfig {
    merchantId: string;
    baseUrl: string;
    jweAuth: {
      keyId: string;
      publicKey: string;
      privateKey: string;
    };
  }
  


  const SANDBOX_BASE_URL=process.env.SANDBOX_BASE_URL;
  const PRODUCTION_BASE_URL=process.env.PRODUCTION_BASE_URL;

  
  // Example instantiation of Juspay
  const myJuspayConfig = new Juspay({
    merchantId: typedConfig.MERCHANT_ID,
    baseUrl: SANDBOX_BASE_URL,
    jweAuth: {
      keyId: typedConfig.KEY_UUID,
      publicKey,
      privateKey
    }
  } as JuspayConfig);


  export const hdfcConfig=typedConfig;
  export const juspayConfig = myJuspayConfig;  // Exporting the Juspay instance
