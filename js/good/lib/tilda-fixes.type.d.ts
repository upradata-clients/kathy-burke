import * as tildaFixes from './tilda-fixes';

declare global {
    export interface UnderScore  {
        tildaZoomIsInited: typeof tildaFixes.tildaZoomIsInited
    }
}
