
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

import config from "./rollup.config";

export default {
    ...config,
    plugins:[...config.plugins,  serve({contentBase:'./example/dist', open:true}),
    livereload({  delay: 2000, verbose:true }),]
}
