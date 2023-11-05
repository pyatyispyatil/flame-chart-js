import { stripesPattern } from './stripes-pattern';
import { dotsPattern } from './dots-pattern';
import { gradientPattern } from './gradient-pattern';
import { combinedPattern } from './combined-pattern';
import { trianglesPattern } from './triangles-pattern';

export const defaultPatterns = {
    stripes: stripesPattern,
    dots: dotsPattern,
    gradient: gradientPattern,
    triangles: trianglesPattern,
    combined: combinedPattern,
} as const;
