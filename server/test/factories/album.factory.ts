import { Selectable } from 'kysely';
import { isUndefined, omitBy } from 'lodash';
import { AssetOrder } from 'src/enum';
import { AlbumTable } from 'src/schema/tables/album.table';
import { AlbumUserFactory } from 'test/factories/album-user.factory';
import { AssetFactory } from 'test/factories/asset.factory';
import { build } from 'test/factories/builder.factory';
import {
  AlbumLike,
  AlbumStub,
  AlbumUserLike,
  AssetLike,
  FactoryBuilder,
  RelationKeysPath,
  UserLike,
} from 'test/factories/types';
import { UserFactory } from 'test/factories/user.factory';
import { newDate, newUuid, newUuidV7 } from 'test/small.factory';

export class AlbumFactory<T extends RelationKeysPath<'album'> = never> {
  #owner: UserFactory;
  #albumUsers?: AlbumUserFactory[];
  #assets?: AssetFactory[];

  private constructor(private readonly value: Selectable<AlbumTable>) {
    value.ownerId ??= newUuid();
    this.#owner = UserFactory.from({ id: value.ownerId });
  }

  static create(dto: AlbumLike = {}) {
    return AlbumFactory.from(dto).build();
  }

  static from(dto: AlbumLike = {}) {
    return new AlbumFactory({
      id: newUuid(),
      ownerId: newUuid(),
      albumName: 'My Album',
      albumThumbnailAssetId: null,
      createdAt: newDate(),
      deletedAt: null,
      description: 'Album description',
      isActivityEnabled: false,
      order: AssetOrder.Desc,
      updatedAt: newDate(),
      updateId: newUuidV7(),
      ...dto,
    }).owner();
  }

  owner(dto: UserLike = {}, builder?: FactoryBuilder<UserFactory>) {
    this.#owner = build(UserFactory.from(dto), builder);
    this.value.ownerId = this.#owner.build().id;
    return this as AlbumFactory<T | 'owner'>;
  }

  albumUser<K extends RelationKeysPath<'albumUser'>>(
    dto: AlbumUserLike = {},
    builder?: FactoryBuilder<AlbumUserFactory<K>>,
  ) {
    const albumUser = build(AlbumUserFactory.from(dto), builder);

    if (!this.#albumUsers) {
      this.#albumUsers = [];
    }

    this.#albumUsers.push(albumUser);

    return this as AlbumFactory<T | 'albumUsers' | (K extends never ? never : `albumUsers.${K}`)>;
  }

  asset<K extends RelationKeysPath<'asset'>>(dto: AssetLike = {}, builder?: FactoryBuilder<AssetFactory<K>>) {
    const asset = build(AssetFactory.from(dto), builder);

    // use album owner by default
    if (!dto.ownerId) {
      asset.owner(this.#owner.build());
    }

    if (!this.#assets) {
      this.#assets = [];
    }

    if (!this.#assets) {
      this.#assets = [];
    }

    this.#assets.push(asset);

    return this as AlbumFactory<T | 'assets' | (K extends never ? never : `assets.${K}`)>;
  }

  build() {
    return omitBy(
      {
        ...this.value,
        owner: this.#owner.build(),
        assets: this.#assets?.map((asset) => asset.build()),
        albumUsers: this.#albumUsers?.map((albumUser) => albumUser.build()),
      },
      isUndefined,
    ) as AlbumStub<T>;
  }
}
