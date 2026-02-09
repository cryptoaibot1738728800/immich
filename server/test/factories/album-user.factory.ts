import { Selectable } from 'kysely';
import { AlbumUserRole } from 'src/enum';
import { AlbumUserTable } from 'src/schema/tables/album-user.table';
import { build } from 'test/factories/builder.factory';
import { AlbumUserLike, AlbumUserStub, FactoryBuilder, RelationKeysPath, UserLike } from 'test/factories/types';
import { UserFactory } from 'test/factories/user.factory';
import { newDate, newUuid, newUuidV7 } from 'test/small.factory';

export class AlbumUserFactory<T extends RelationKeysPath<'albumUser'> = never> {
  #user?: UserFactory;

  private constructor(private readonly value: Selectable<AlbumUserTable>) {}

  static create(dto: AlbumUserLike = {}) {
    return AlbumUserFactory.from(dto).build();
  }

  static from(dto: AlbumUserLike = {}) {
    return new AlbumUserFactory({
      albumId: newUuid(),
      userId: newUuid(),
      role: AlbumUserRole.Editor,
      createId: newUuidV7(),
      createdAt: newDate(),
      updateId: newUuidV7(),
      updatedAt: newDate(),
      ...dto,
    });
  }

  user(dto: UserLike = {}, builder?: FactoryBuilder<UserFactory>) {
    const user = build(UserFactory.from(dto), builder);
    this.#user = user;
    this.value.userId = user.build().id;
    return this as AlbumUserFactory<T | 'user'>;
  }

  build() {
    return {
      ...this.value,
      user: this.#user?.build(),
    } as AlbumUserStub<T>;
  }
}
