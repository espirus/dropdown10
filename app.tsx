/** @jsx h */
import {
  autocomplete,
  AutocompleteComponents,
  getAlgoliaResults,
} from '@algolia/autocomplete-js';
import algoliasearch from 'algoliasearch';
import { h, Fragment } from 'preact';

import '@algolia/autocomplete-theme-classic';

import { createLocalStorageRecentlyViewedItems } from './recentlyViewedItemsPlugin';
import { ProductHit } from './types';

const appId = 'ID8MXCV7Z3';
const apiKey = '874729ea72be7faf693a284a4f6dba33';
const searchClient = algoliasearch(appId, apiKey);

const recentlyViewedItems = createLocalStorageRecentlyViewedItems({
  key: 'RECENTLY_VIEWED',
  limit: 5,
});

autocomplete<ProductHit>({
  container: '#autocomplete',
  placeholder: 'Search',
  openOnFocus: true,
  plugins: [recentlyViewedItems],
  getSources({ query }) {
    if (!query) {
      return [];
    }

    return [
      {
        sourceId: 'products',
        getItems() {
          return getAlgoliaResults<ProductHit>({
            searchClient,
            queries: [
              {
                indexName: 'images',
                query,
                params: {
                  clickAnalytics: true,
                  attributesToSnippet: ['name:10', 'description:35'],
                  snippetEllipsisText: '…',
                },
              },
            ],
          });
        },
        onSelect({ item }) {
          recentlyViewedItems.data.addItem({
            id: item.objectID,
            label: item.name,
            image: item.image,
            url: item.url,
          });
        },
        templates: {
          header() {
            return (
              <Fragment>
                <span className="aa-SourceHeaderTitle">Products</span>
                <div className="aa-SourceHeaderLine" />
              </Fragment>
            );
          },
          item({ item, components }) {
            return (
              <AutocompleteProductItem hit={item} components={components} />
            );
          },
          noResults() {
            return 'No products for this query.';
          },
        },
      },
    ];
  },
});

type ProductItemProps = {
  hit: ProductHit;
  components: AutocompleteComponents;
};

function AutocompleteProductItem({ hit, components }: ProductItemProps) {
  return (
    <div className="aa-ItemWrapper">
      <div className="aa-ItemContent">
        <div className="aa-ItemIcon aa-ItemIcon--alignTop">
          <img src={hit.image} alt={hit.name} width="100" height="100" />
        </div>
        <div className="aa-ItemContentBody">
          <div className="aa-ItemContentTitle">
            <components.Highlight hit={hit} attribute="name" />
          </div>
        </div>
      </div>
      <div className="aa-ItemActions">
        <button
          className="aa-ItemActionButton aa-DesktopOnly aa-ActiveOnly"
          type="button"
          title="Select"
          style={{ pointerEvents: 'none' }}
        >
          <svg viewBox="0 0 94 94" width="100" height="100" fill="currentColor">
            <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
