import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { prepareProjectSummary } from "njra-api-client";

interface Inputs {
  applicationId: any;
  landlortCertId: any;
  landlortCertRef: any;
  tenantGrantAgreementRef: any;
  tenantGrantAgreementId: any;
  refsOnly: any;
}

const getSecrets = () => {
  const NJRA_projectSummaryFormId = process.env["NJRA_projectSummaryFormId"];
  const NJRA_projectSummaryFlowUrl = process.env["NJRA_projectSummaryFlowUrl"];
  const NJRA_API_KEY = process.env["NJRA_API_KEY"];
  const NJRA_API_SECRET = process.env["NJRA_API_SECRET"];

  if (!NJRA_projectSummaryFormId) {
    throw new Error("Missing secret: NJRA_projectSummaryFormId");
  }
  if (!NJRA_projectSummaryFlowUrl) {
    throw new Error("Missing secret: NJRA_projectSummaryFlowUrl");
  }
  if (!NJRA_API_KEY) {
    throw new Error("Missing secret: NJRA_API_KEY");
  }
  if (!NJRA_API_SECRET) {
    throw new Error("Missing secret: NJRA_API_SECRET");
  }

  return {
    NJRA_projectSummaryFormId,
    NJRA_projectSummaryFlowUrl,
    NJRA_API_KEY,
    NJRA_API_SECRET,
  };
};

const getInputErrors = (inputs: Inputs): string[] => {
  const errors = [];

  const missing = Object.entries(inputs).filter(([k, v]) => v === undefined);
  if (missing.length) {
    errors.push(`Missing required properties: ${missing.map(([k, v]) => k)}`);
  }

  return errors;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const params = {
    applicationId: req.body?.applicationId,
    landlortCertId: req.body?.landlortCertId,
    landlortCertRef: req.body?.landlortCertRef,
    tenantGrantAgreementRef: req.body?.tenantGrantAgreementRef,
    tenantGrantAgreementId: req.body?.tenantGrantAgreementId,
    refsOnly: req.body?.refsOnly || false,
  };

  context.log("Preparing Project Summary", params);

  const inputErrors = getInputErrors(params);
  if (inputErrors.length) {
    context.log.warn(inputErrors);
    context.res = {
      status: 400,
      body: inputErrors,
    };
    return;
  }

  const secrets = getSecrets();
  const response = await prepareProjectSummary(
    params,
    secrets.NJRA_projectSummaryFormId,
    secrets.NJRA_projectSummaryFlowUrl,
    secrets.NJRA_API_KEY,
    secrets.NJRA_API_SECRET
  );

  context.log("Success", response);
  context.res = {
    body: response,
  };
};

export default httpTrigger;
