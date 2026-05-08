import { z } from 'zod/v4';
import { languageContext } from '$lib/context';
import * as m from '$lib/paraglide/messages.js';
import { baseLocale } from '$lib/paraglide/runtime.js';

z.config({
  customError: (iss) => {
    const locale = languageContext.getStore() || baseLocale;

    if (iss.code === 'too_small' && iss.minimum === 1) {
      return m.form_invalid_nonempty({}, { locale });
    } else if (iss.code === 'too_small' && iss.minimum > 1) {
      return m.form_invalid_minimum({ minimum: iss.minimum }, { locale });
    }
  }
});

export { z };