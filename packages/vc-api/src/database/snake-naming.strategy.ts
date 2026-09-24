import { DefaultNamingStrategy, type NamingStrategyInterface } from 'typeorm';

const toSnake = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

/** Colunas em snake_case no banco (createdAt -> created_at), propriedades em camelCase no código. */
export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  override columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    const prefix = embeddedPrefixes.length ? `${embeddedPrefixes.map(toSnake).join('_')}_` : '';
    return prefix + (customName ?? toSnake(propertyName));
  }

  override relationName(propertyName: string): string {
    return toSnake(propertyName);
  }

  override joinColumnName(relationName: string, referencedColumnName: string): string {
    return toSnake(`${relationName}_${referencedColumnName}`);
  }
}
