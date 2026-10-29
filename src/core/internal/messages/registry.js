/**
 * Registry of chrome message catalogs, keyed by lower-case BCP-47 tag. To add
 * a locale, create `<tag>.js` beside this file (copy `en.js`, translate the
 * values) and add one import and one line below; see docs/LOCALES.md.
 */
import ar from './ar.js';
import az from './az.js';
import bg from './bg.js';
import bn from './bn.js';
import bs from './bs.js';
import ca from './ca.js';
import cs from './cs.js';
import da from './da.js';
import de from './de.js';
import el from './el.js';
import en from './en.js';
import es from './es.js';
import et from './et.js';
import fa from './fa.js';
import fi from './fi.js';
import fr from './fr.js';
import he from './he.js';
import hi from './hi.js';
import hr from './hr.js';
import hu from './hu.js';
import hy from './hy.js';
import id from './id.js';
import is from './is.js';
import it from './it.js';
import ja from './ja.js';
import ka from './ka.js';
import kk from './kk.js';
import kn from './kn.js';
import ko from './ko.js';
import lt from './lt.js';
import lv from './lv.js';
import mk from './mk.js';
import ml from './ml.js';
import mr from './mr.js';
import ms from './ms.js';
import nb from './nb.js';
import ne from './ne.js';
import nl from './nl.js';
import pl from './pl.js';
import pt from './pt.js';
import ro from './ro.js';
import ru from './ru.js';
import sk from './sk.js';
import sl from './sl.js';
import sq from './sq.js';
import sr from './sr.js';
import srLatn from './sr-latn.js';
import sv from './sv.js';
import ta from './ta.js';
import te from './te.js';
import th from './th.js';
import tr from './tr.js';
import uk from './uk.js';
import ur from './ur.js';
import uz from './uz.js';
import vi from './vi.js';
import zhHans from './zh-hans.js';
import zhHant from './zh-hant.js';

/** @type {Readonly<Record<string, Readonly<Record<string, string | ((...args: string[]) => string)>>>>} */
export const CATALOGS = Object.freeze({
  ar,
  az,
  bg,
  bn,
  bs,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  et,
  fa,
  fi,
  fr,
  he,
  hi,
  hr,
  hu,
  hy,
  id,
  is,
  it,
  ja,
  ka,
  kk,
  kn,
  ko,
  lt,
  lv,
  mk,
  ml,
  mr,
  ms,
  nb,
  ne,
  nl,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  sq,
  sr,
  'sr-latn': srLatn,
  sv,
  ta,
  te,
  th,
  tr,
  uk,
  ur,
  uz,
  vi,
  'zh-hans': zhHans,
  'zh-hant': zhHant,
});
