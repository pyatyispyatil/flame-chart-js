import { stripesPattern } from './stripes-pattern';
import { dotsPattern } from './dots-pattern';
import { gradientPattern } from './gradient-pattern';
import { combinedPattern } from './combined-pattern';

export const defaultPatterns = {
    stripes: stripesPattern,
    dots: dotsPattern,
    gradient: gradientPattern,
    combined: combinedPattern,
} as const;
