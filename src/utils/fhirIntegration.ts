/**
 * Bloom Health - FHIR Interoperability Module
 * 
 * This module provides production-ready data mapping utilities to convert local
 * Bloom app health data into HL7 FHIR R4 compliant Observation resources.
 * It also includes an OAuth 2.0 client for securely POSTing this data to 
 * enterprise EHR systems (e.g., Epic, Cerner).
 */

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

// --- Bloom App Local Data Types ---

export interface BloomBloodPressure {
  id: string;
  patientId: string; // The EHR patient identifier (e.g., MRN or FHIR Patient ID)
  systolic: number;  // mmHg
  diastolic: number; // mmHg
  timestamp: string; // ISO 8601 string
}

export interface BloomWeight {
  id: string;
  patientId: string;
  weightKg: number;  // Kilograms
  timestamp: string; // ISO 8601 string
}

export interface BloomFetalKick {
  id: string;
  patientId: string;
  count: number;     // Number of kicks felt
  durationMinutes: number; // Over what period
  timestamp: string; // ISO 8601 string
}

// --- FHIR R4 Observation Types (Simplified for this scope) ---

export interface FHIRCodeableConcept {
  coding: Array<{
    system: string;
    code: string;
    display: string;
  }>;
  text?: string;
}

export interface FHIRQuantity {
  value: number;
  unit: string;
  system: string;
  code: string;
}

export interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  valueQuantity: FHIRQuantity;
}

export interface FHIRObservation {
  resourceType: "Observation";
  status: "registered" | "preliminary" | "final" | "amended";
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: {
    reference: string; // e.g., "Patient/12345"
  };
  effectiveDateTime: string;
  valueQuantity?: FHIRQuantity;
  component?: FHIRObservationComponent[];
}

// ============================================================================
// 2. DATA MAPPING LOGIC
// ============================================================================

const LOINC_SYSTEM = "http://loinc.org";
const UCUM_SYSTEM = "http://unitsofmeasure.org";

/**
 * Maps a Bloom Blood Pressure reading to a FHIR R4 Observation.
 * Uses LOINC 85354-9 (Blood pressure panel) with systolic and diastolic components.
 */
export function mapBloodPressureToFHIR(data: BloomBloodPressure): FHIRObservation {
  console.info(`[FHIR Mapper] Mapping Blood Pressure ID: ${data.id}`);
  
  return {
    resourceType: "Observation",
    status: "final",
    category: [{
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }]
    }],
    code: {
      coding: [{ system: LOINC_SYSTEM, code: "85354-9", display: "Blood pressure panel with all children optional" }],
      text: "Blood pressure systolic & diastolic"
    },
    subject: {
      reference: `Patient/${data.patientId}`
    },
    effectiveDateTime: data.timestamp,
    component: [
      {
        code: {
          coding: [{ system: LOINC_SYSTEM, code: "8480-6", display: "Systolic blood pressure" }]
        },
        valueQuantity: { value: data.systolic, unit: "mmHg", system: UCUM_SYSTEM, code: "mm[Hg]" }
      },
      {
        code: {
          coding: [{ system: LOINC_SYSTEM, code: "8462-4", display: "Diastolic blood pressure" }]
        },
        valueQuantity: { value: data.diastolic, unit: "mmHg", system: UCUM_SYSTEM, code: "mm[Hg]" }
      }
    ]
  };
}

/**
 * Maps a Bloom Weight measurement to a FHIR R4 Observation.
 * Uses LOINC 29463-7 (Body weight).
 */
export function mapWeightToFHIR(data: BloomWeight): FHIRObservation {
  console.info(`[FHIR Mapper] Mapping Weight ID: ${data.id}`);

  return {
    resourceType: "Observation",
    status: "final",
    category: [{
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }]
    }],
    code: {
      coding: [{ system: LOINC_SYSTEM, code: "29463-7", display: "Body weight" }],
      text: "Body weight"
    },
    subject: {
      reference: `Patient/${data.patientId}`
    },
    effectiveDateTime: data.timestamp,
    valueQuantity: {
      value: data.weightKg,
      unit: "kg",
      system: UCUM_SYSTEM,
      code: "kg"
    }
  };
}

/**
 * Maps a Bloom Fetal Kick Count to a FHIR R4 Observation.
 * Uses LOINC 57083-8 (Fetal movement count).
 */
export function mapFetalKickCountToFHIR(data: BloomFetalKick): FHIRObservation {
  console.info(`[FHIR Mapper] Mapping Fetal Kick Count ID: ${data.id}`);

  return {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{ system: LOINC_SYSTEM, code: "57083-8", display: "Fetal movement count" }],
      text: `Fetal movement count over ${data.durationMinutes} minutes`
    },
    subject: {
      reference: `Patient/${data.patientId}`
    },
    effectiveDateTime: data.timestamp,
    valueQuantity: {
      value: data.count,
      unit: "kicks",
      system: UCUM_SYSTEM,
      code: "{kicks}" // Custom UCUM annotation for counts
    }
  };
}

// ============================================================================
// 3. OAUTH 2.0 & EHR API CLIENT
// ============================================================================

export interface EHRClientConfig {
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
  fhirBaseUrl: string;
}

export class EHRFHIRClient {
  private config: EHRClientConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: EHRClientConfig) {
    this.config = config;
  }

  /**
   * Authenticates with the EHR authorization server using Client Credentials flow.
   * Handles token refresh logic automatically.
   */
  private async authenticate(): Promise<string> {
    // Check if we have a valid token that expires in more than 60 seconds
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    console.info(`[EHR Client] Requesting new OAuth 2.0 Bearer token from ${this.config.tokenEndpoint}`);

    try {
      const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'system/Observation.write'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Calculate expiration time (data.expires_in is usually in seconds)
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
      
      console.info(`[EHR Client] Successfully authenticated. Token expires at ${new Date(this.tokenExpiresAt).toISOString()}`);
      return this.accessToken!;
    } catch (error) {
      console.error('[EHR Client] OAuth 2.0 Authentication Error:', error);
      throw new Error('Failed to authenticate with EHR system.');
    }
  }

  /**
   * POSTs a FHIR Observation resource to the EHR system.
   */
  public async postObservation(observation: FHIRObservation): Promise<boolean> {
    try {
      const token = await this.authenticate();
      const endpoint = `${this.config.fhirBaseUrl}/Observation`;
      
      console.info(`[EHR Client] POSTing Observation to ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/fhir+json'
        },
        body: JSON.stringify(observation)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[EHR Client] Failed to POST Observation. Status: ${response.status}. Details: ${errorBody}`);
        return false;
      }

      console.info(`[EHR Client] Successfully POSTed Observation to EHR.`);
      return true;
    } catch (error) {
      console.error('[EHR Client] Error posting observation:', error);
      return false;
    }
  }
}

// ============================================================================
// 4. EXAMPLE USAGE
// ============================================================================

/**
 * Demonstrates how to use the mappers and the EHR client.
 * This function can be called from a UI component or background sync job.
 */
export async function syncBloomDataToEHR() {
  // 1. Initialize the client with environment-specific EHR configurations
  const ehrClient = new EHRFHIRClient({
    clientId: process.env.EHR_CLIENT_ID || 'demo-client-id',
    clientSecret: process.env.EHR_CLIENT_SECRET || 'demo-client-secret',
    tokenEndpoint: process.env.EHR_TOKEN_ENDPOINT || 'https://authorization.epic.com/oauth2/token',
    fhirBaseUrl: process.env.EHR_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
  });

  // 2. Sample local Bloom data
  const sampleBP: BloomBloodPressure = {
    id: 'bp-123',
    patientId: 'eq081-VQEgP8drUUqCWzHfw3', // Epic FHIR ID example
    systolic: 120,
    diastolic: 80,
    timestamp: new Date().toISOString()
  };

  const sampleWeight: BloomWeight = {
    id: 'wt-456',
    patientId: 'eq081-VQEgP8drUUqCWzHfw3',
    weightKg: 68.5,
    timestamp: new Date().toISOString()
  };

  // 3. Map local data to FHIR Observations
  const fhirBP = mapBloodPressureToFHIR(sampleBP);
  const fhirWeight = mapWeightToFHIR(sampleWeight);

  // 4. POST to EHR
  // In a real scenario, you would likely batch these or use a FHIR Transaction Bundle
  await ehrClient.postObservation(fhirBP);
  await ehrClient.postObservation(fhirWeight);
}
