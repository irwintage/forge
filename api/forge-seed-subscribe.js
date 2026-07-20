export default async function handler(req, res) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://forge.chrysasynth.com'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const { email, seedId } = req.body || {};

  const isValidEmail =
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail) {
    return res.status(400).json({
      error: 'Invalid email'
    });
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(500).json({
      error: 'Brevo API key is missing'
    });
  }

  try {
    const response = await fetch(
      'https://api.brevo.com/v3/contacts',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },

        body: JSON.stringify({
          email,
          updateEnabled: true
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Brevo error:',
        response.status,
        errorText
      );

      return res.status(502).json({
        error: 'Brevo request failed'
      });
    }

    return res.status(200).json({
      success: true,
      seedId: seedId || null
    });

  } catch (error) {
    console.error(
      'Forge Seed subscribe error:',
      error
    );

    return res.status(500).json({
      error: 'Server error'
    });
  }
}
