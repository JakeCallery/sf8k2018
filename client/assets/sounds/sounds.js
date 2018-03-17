const faviconsContext = require.context(
    '!!file-loader?name=[name].[ext]!',
    true,
    /\.(m4a|ogg|mp3|wav)$/
);
faviconsContext.keys().forEach(faviconsContext);