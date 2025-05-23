// Custom zod instance with improved preconfigured messages
import { z } from 'zod/v4';
import * as m from '$lib/paraglide/messages.js';

z.config({
  customError: (iss) => {
    if (iss.code === 'too_small' && iss.minimum === 1) {
      return m.form_invalid_nonempty();
    }
  }
});

export { z };