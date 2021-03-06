import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { dataService } from '../cache/builders/build-decorators';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { CoreState } from '../core.reducers';
import { Bundle } from '../shared/bundle.model';
import { BUNDLE } from '../shared/bundle.resource-type';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import { DataService } from './data.service';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { PaginatedList } from './paginated-list';
import { RemoteData } from './remote-data';
import { FindListOptions } from './request.models';
import { RequestService } from './request.service';

/**
 * A service to retrieve {@link Bundle}s from the REST API
 */
@Injectable(
  {providedIn: 'root'}
)
@dataService(BUNDLE)
export class BundleDataService extends DataService<Bundle> {
  protected linkPath = 'bundles';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<Bundle>) {
    super();
  }

  /**
   * Retrieve all {@link Bundle}s in the given {@link Item}
   *
   * @param item the {@link Item} the {@link Bundle}s are a part of
   * @param options the {@link FindListOptions} for the request
   * @param linksToFollow the {@link FollowLinkConfig}s for the request
   */
  findAllByItem(item: Item, options?: FindListOptions, ...linksToFollow: Array<FollowLinkConfig<Bundle>>): Observable<RemoteData<PaginatedList<Bundle>>> {
    return this.findAllByHref(item._links.bundles.href, options,  ...linksToFollow);
  }

  /**
   * Retrieve a {@link Bundle} in the given {@link Item} by name
   *
   * @param item the {@link Item} the {@link Bundle}s are a part of
   * @param bundleName the name of the {@link Bundle} to retrieve
   * @param linksToFollow the {@link FollowLinkConfig}s for the request
   */
  // TODO should be implemented rest side
  findByItemAndName(item: Item, bundleName: string, ...linksToFollow: Array<FollowLinkConfig<Bundle>>): Observable<RemoteData<Bundle>> {
    return this.findAllByItem(item, { elementsPerPage: Number.MAX_SAFE_INTEGER }, ...linksToFollow).pipe(
      map((rd: RemoteData<PaginatedList<Bundle>>) => {
        if (hasValue(rd.payload) && hasValue(rd.payload.page)) {
          const matchingBundle = rd.payload.page.find((bundle: Bundle) =>
            bundle.name === bundleName);
          return new RemoteData(
            false,
            false,
            true,
            undefined,
            matchingBundle
          );
        } else {
          return rd as any;
        }
      }),
    );
  }
}
