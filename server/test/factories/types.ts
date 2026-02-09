import { Selectable } from 'kysely';
import { AlbumUserTable } from 'src/schema/tables/album-user.table';
import { AlbumTable } from 'src/schema/tables/album.table';
import { AssetEditTable } from 'src/schema/tables/asset-edit.table';
import { AssetExifTable } from 'src/schema/tables/asset-exif.table';
import { AssetFileTable } from 'src/schema/tables/asset-file.table';
import { AssetTable } from 'src/schema/tables/asset.table';
import { SharedLinkTable } from 'src/schema/tables/shared-link.table';
import { UserTable } from 'src/schema/tables/user.table';

type Substitute<T extends string, K extends string> = T extends `${infer _L}.${infer R}` ? `${K}.${R}` : K;

type GetField<T extends string, F extends string, K extends keyof RelationKeys | string> = T extends `${F}.${infer R}`
  ? R extends RelationKeysPath<keyof RelationKeys>
    ? Substitute<R, K>
    : never
  : never;
type GetRoot<T extends string> = T extends `${infer L}.${string}` ? L : T;

type RelationKeysPathInternal<T = RelationKeys> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${RelationKeysPathInternal<T[K]>}`
    : T[K] extends keyof RelationKeys
      ? K | `${K}.${RelationKeysPathInternal<RelationKeys[T[K]]>}`
      : K;
}[keyof T & string];

export type RelationKeysPath<T extends keyof RelationKeys | '' = ''> = T extends keyof RelationKeys
  ? RelationKeysPathInternal<RelationKeys[T]>
  : RelationKeysPathInternal | keyof RelationKeys;

export type FactoryBuilder<T, R extends T = T> = (builder: T) => R;

export type AssetLike = Partial<Selectable<AssetTable>>;
export type AssetExifLike = Partial<Selectable<AssetExifTable>>;
export type AssetEditLike = Partial<Selectable<AssetEditTable>>;
export type AssetFileLike = Partial<Selectable<AssetFileTable>>;
export type AlbumLike = Partial<Selectable<AlbumTable>>;
export type AlbumUserLike = Partial<Selectable<AlbumUserTable>>;
export type SharedLinkLike = Partial<Selectable<SharedLinkTable>>;
export type UserLike = Partial<Selectable<UserTable>>;

type RelationKeys = {
  album: { owner: 'user'; assets: 'asset'; albumUsers: 'albumUser' };
  asset: { exif: 'exif'; owner: 'user'; edits: 'assetEdit'; files: 'assetFile' };
  albumUser: { user: 'user' };
  sharedLink: { owner: 'user'; album: 'album' };
};

// TODO technically we have all the relevant information already in `RelationKeys`
// Consider removing these
type AlbumRelations<T extends RelationKeysPath<'album'>> = Pick<
  {
    owner: UserStub;
    assets: AssetStub<GetField<T, 'assets', 'asset'>>[];
    albumUsers: AlbumUserStub<GetField<T, 'albumUsers', 'albumUser'>>[];
  },
  GetRoot<T>
>;

type AssetRelations<T extends RelationKeysPath<'asset'>> = Pick<
  {
    exif: ExifStub;
    owner: UserStub;
    edits: AssetEditStub;
    files: AssetFileStub;
  },
  GetRoot<T>
>;

type AlbumUserRelations<T extends RelationKeysPath<'albumUser'>> = Pick<
  {
    user: UserStub;
  },
  GetRoot<T>
>;

type SharedLinkRelations<T extends RelationKeysPath<'sharedLink'>> = Pick<
  {
    owner: UserStub;
    album: AlbumStub<GetField<T, 'album', 'album'>>;
  },
  GetRoot<T>
>;

export type AlbumStub<T extends RelationKeysPath<'album'>> = Selectable<AlbumTable> & AlbumRelations<T>;
export type UserStub = Selectable<UserTable>;
export type AssetStub<T extends RelationKeysPath<'asset'>> = Selectable<AssetTable> & AssetRelations<T>;
export type AlbumUserStub<T extends RelationKeysPath<'albumUser'>> = Selectable<AlbumUserTable> & AlbumUserRelations<T>;
export type SharedLinkStub<T extends RelationKeysPath<'sharedLink'>> = Selectable<SharedLinkTable> &
  SharedLinkRelations<T>;
export type ExifStub = Selectable<AssetExifTable>;
export type AssetEditStub = Selectable<AssetEditTable>;
export type AssetFileStub = Selectable<AssetFileTable>;
