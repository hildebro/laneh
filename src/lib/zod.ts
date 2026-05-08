import { z } from 'zod/v4';
import { getLocale } from '$lib/context';
import * as m from '$lib/paraglide/messages.js';

z.config({
  customError: (iss) => {
    const locale = getLocale();

    if (iss.code === 'too_small' && iss.minimum === 1) {
      return m.form_invalid_nonempty({}, { locale });
    } else if (iss.code === 'too_small' && iss.minimum > 1) {
      return m.form_invalid_minimum({ minimum: iss.minimum }, { locale });
    }
  }
});

export { z };