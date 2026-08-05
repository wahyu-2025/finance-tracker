import express from 'express';
import { CorsHelper } from './helpers/express/cors';
import { CompressionHelper } from './helpers/express/compression';
import { MorganHelper } from './helpers/express/morgan';
import { JsonHelper } from './helpers/express/json';
import { UrlencodedHelper } from './helpers/express/urlencoded';
import { OrmHelper } from './helpers/orm';
import { RoutePrivate } from './routes/private';
import { RoutePublic } from './routes/public';
import { Language } from './langs/lang';
import { SwaggerHelper } from './helpers/express/swagger';
import { TrustProxyHelper } from './helpers/express/trust_proxy';

const app = express();

CorsHelper.setup(app);
CompressionHelper.setup(app);
MorganHelper.setup(app);
JsonHelper.setup(app);
UrlencodedHelper.setup(app);
OrmHelper.setup();
Language.setup();
TrustProxyHelper.setup(app);
SwaggerHelper.setup(app);
RoutePublic.setup(app);
RoutePrivate.setup(app);

export { app };