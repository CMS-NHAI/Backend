import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

/**
 * Generates a configurable invitation link.
 */
const generateInvitationLink = ({
  baseUrl = "https://example.com/invite",
  expiryTime = 1440,
  extraParams = {}
} = {}) => {
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('Invalid base URL provided!');
  }

  // Create a unique identifier (UUID)
  const uniqueToken = uuidv4();

  // Set the expiration time (in minutes)
  const expirationTime = moment().add(expiryTime, 'minutes').unix();

  // Ensure extraParams values are strings
  const sanitizedParams = Object.fromEntries(
    Object.entries(extraParams).map(([key, value]) => [key, String(value)])
  );

  // Initialize the query parameters with token and expiration time
  const params = {
    token: uniqueToken,
    expires: expirationTime,
    ...sanitizedParams
  };

  // Convert params to query string
  const queryString = new URLSearchParams(params).toString();

  // Build the complete invitation link
  return `${baseUrl}?${queryString}`;
};

// Example usage
try {
  const invitationLink = generateInvitationLink({
    baseUrl: "https://mywebsite.com/invite",
    expiryTime: 720,
    extraParams: {
      userType: "guest",
      referrer: "abc123"
    }
  });

  console.log('Generated Invitation Link:', invitationLink);
} catch (error) {
  console.error('Error:', error.message);
}
