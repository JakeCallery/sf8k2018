const soundsContext = require.context(
    '!!file-loader?name=[name].[ext]!.',
    true,
    /\.(m4a|ogg|mp3|wav)$/
);
soundsContext.keys().forEach(soundsContext);