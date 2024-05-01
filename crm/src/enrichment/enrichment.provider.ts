import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IEnrichment } from './interfaces/enrichment.interface';
import { EnrichmentProviderName } from './enrichment-provider.enum';
import { ApolloService } from './providers/apollo.service';
import { ZoomInfoService } from './providers/zoominfo.service';
import { ClearBitService } from './providers/clearbit.service';

@Injectable()
export class EnrichmentProvider implements OnModuleInit {
  private logger = new Logger(EnrichmentProvider.name);

  providers: { [key: string]: IEnrichment } = {};

  constructor(
    private readonly apolloService: ApolloService,
    private readonly clearbitService: ClearBitService,
    private readonly zoominfoService: ZoomInfoService,
  ) {}

  onModuleInit() {
    this.providers[EnrichmentProviderName.APOLLO] = this.apolloService;
    this.providers[EnrichmentProviderName.CLEARBIT] = this.clearbitService;
    this.providers[EnrichmentProviderName.ZOOMINFO] = this.zoominfoService;

    this.logger.log('Enrichment providers initialized successfully.');
  }

  getProvider(name: string): IEnrichment {
    return this.providers[name];
  }
}
