import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts)
    if (p.startsWith("ja_customer_token="))
      return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "POST")
    return createErrorResponse("Method not allowed", 405);

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    let token = body.token || "";
    const cookieToken = getTokenFromCookie(
      event.headers.cookie || event.headers.Cookie
    );
    if (!token && cookieToken) token = cookieToken;
    const address = body.address || {};

    if (!token) return createErrorResponse("Unauthorized", 401);

    // Prepare input for MailingAddressInput (do not pass `default`)
    const setDefault = !!address.default;
    const addrInput = { ...address };
    delete addrInput.default;

    const client = createShopifyClient();

    // Create address
    const mutationCreate = `
      mutation AddressCreate($token: String!, $address: MailingAddressInput!) {
        customerAddressCreate(customerAccessToken: $token, address: $address) {
          customerAddress { id }
          userErrors { message field code }
        }
      }
    `;

    const respCreate = await client.request(mutationCreate, {
      variables: { token, address: addrInput },
    });
    const dataCreate = handleGraphQLResponse(respCreate).customerAddressCreate;
    if (dataCreate.userErrors?.length) {
      const e = dataCreate.userErrors[0];
      if (String(e?.code || "").toUpperCase() === "UNAUTHORIZED") {
        return createErrorResponse(e?.message || "Unauthorized", 401);
      }
      return createErrorResponse(e?.message || "Failed to create address", 400);
    }

    const newId = dataCreate.customerAddress?.id || null;
    if (!newId) return createErrorResponse("Failed to create address", 500);

    // Optionally set default
    if (setDefault) {
      const mutationDefault = `
        mutation DefaultAddress($token: String!, $addressId: ID!) {
          customerDefaultAddressUpdate(customerAccessToken: $token, addressId: $addressId) {
            customer { id defaultAddress { id } }
            userErrors { message field code }
          }
        }
      `;
      const respDefault = await client.request(mutationDefault, {
        variables: { token, addressId: newId },
      });
      const dataDefault =
        handleGraphQLResponse(respDefault).customerDefaultAddressUpdate;
      if (dataDefault.userErrors?.length) {
        const e = dataDefault.userErrors[0];
        // Still return 200 for the create, but surface defaulting error
        return createApiResponse(
          {
            ok: true,
            address: { id: newId, ...addrInput },
            defaultApplied: false,
            defaultError: e?.message || "Failed to set default",
          },
          200
        );
      }
    }

    return createApiResponse(
      {
        ok: true,
        address: { id: newId, ...addrInput },
        defaultApplied: setDefault,
      },
      200
    );
  } catch (err) {
    return createErrorResponse(err.message || "Failed to add address", 500);
  }
};
