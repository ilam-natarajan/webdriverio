import { IGNORED_URLS, UNSUPPORTED_ERROR_MESSAGE } from './constants'

const VERSION_PROPS = ['browserVersion', 'browser_version', 'version']
const SUPPORTED_BROWSERS_AND_MIN_VERSIONS = {
    'chrome': 63,
    'chromium' : 63,
    'googlechrome': 63,
    'google chrome': 63
}

export function setUnsupportedCommand () {
    return global.browser.addCommand('cdp', /* istanbul ignore next */() => {
        throw new Error(UNSUPPORTED_ERROR_MESSAGE)
    })
}

export function sumByKey (list, key) {
    return list.map((data) => data[key]).reduce((acc, val) => acc + val, 0)
}

/**
 * check if url is supported for tracing
 * @param  {String}  url to check for
 * @return {Boolean}     true if url was opened by user
 */
export function isSupportedUrl (url) {
    return IGNORED_URLS.filter((ignoredUrl) => url.startsWith(ignoredUrl)).length === 0
}

/**
 * Approximates the Gauss error function, the probability that a random variable
 * from the standard normal distribution lies within [-x, x]. Moved from
 * traceviewer.b.math.erf, based on Abramowitz and Stegun, formula 7.1.26.
 * @param {number} x
 * @return {number}
 */
function internalErf_ (x) {
    // erf(-x) = -erf(x);
    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)

    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911
    const t = 1 / (1 + p * x)
    const y = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))))
    return sign * (1 - y * Math.exp(-x * x))
}

/**
 * Creates a log-normal distribution and finds the complementary
 * quantile (1-percentile) of that distribution at value. All
 * arguments should be in the same units (e.g. milliseconds).
 *
 * @param {number} median
 * @param {number} falloff
 * @param {number} value
 * @return The complement of the quantile at value.
 * @customfunction
 */
export function quantileAtValue (median, falloff, value) {
    const location = Math.log(median)

    // The "falloff" value specified the location of the smaller of the positive
    // roots of the third derivative of the log-normal CDF. Calculate the shape
    // parameter in terms of that value and the median.
    const logRatio = Math.log(falloff / median)
    const shape = Math.sqrt(1 - 3 * logRatio - Math.sqrt((logRatio - 3) * (logRatio - 3) - 8)) / 2

    const standardizedX = (Math.log(value) - location) / (Math.SQRT2 * shape)
    return (1 - internalErf_(standardizedX)) / 2
}

/**
 * check if browser version is lower than `minVersion`
 * @param {object} caps capabilities
 * @param {number} minVersion minimal chrome browser version
 */
export function isBrowserVersionLower (caps, minVersion) {
    const browserVersion = getBrowserMajorVersion(caps[VERSION_PROPS.find(prop => caps[prop])])
    return typeof browserVersion === 'number' && browserVersion < minVersion
}

/**
 * get chromedriver major version
 * @param   {string|*}      version chromedriver version like `78.0.3904.11` or just `78`
 * @return  {number|*}              either major version, ex `78`, or whatever value is passed
 */
export function getBrowserMajorVersion (version) {
    let majorVersion = version
    if (typeof version === 'string') {
        majorVersion = Number(version.split('.')[0])
        majorVersion = isNaN(majorVersion) ? version : majorVersion
    }
    return majorVersion
}

/**
 * check if browser is supported based on caps.browserName and caps.version
 * @param {object} caps capabilities
 */
export function isBrowserSupported(caps) {
    if (
        !caps.browserName ||
        !(caps.browserName.toLowerCase() in SUPPORTED_BROWSERS_AND_MIN_VERSIONS) ||
        isBrowserVersionLower(caps, SUPPORTED_BROWSERS_AND_MIN_VERSIONS[caps.browserName.toLowerCase()])){
        return false
    }
    return true
}
