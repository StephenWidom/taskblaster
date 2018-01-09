#!/usr/bin/env bash

yarn add react react-dom babel-cli babel-preset-env babel-preset-react webpack babel-core babel-loader webpack-dev-server babel-plugin-transform-class-properties style-loader css-loader sass-loader node-sass

cp ~/Dropbox/webpack.config.js ./
cp ~/Dropbox/.babelrc ./

mkdir public_html
mkdir src
mkdir src/components
mkdir src/styles
touch src/app.js
touch public_html/index.html
