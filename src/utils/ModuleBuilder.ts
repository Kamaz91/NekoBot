import { Knex } from "knex";

type ConfigSQL = Array<(guildsArray: string[]) => Knex.QueryBuilder>;
type ConfigTemplate = Record<string, any>;
type ConfigProcessData = (GuildsIds: string[], data: any[]) => Map<string, any>;

export default class ModuleBuilder {
    cfg: {
        Template: ConfigTemplate;
        SQL: ConfigSQL;
        PrepareData: ConfigProcessData;
    }
    execute: () => void;

    constructor() {
        this.cfg = {
            Template: {},
            SQL: new Array(),
            PrepareData: function () { return new Map() }
        }
        this.execute = () => { };
    }

    setConfig(sql: ConfigSQL, Template: ConfigTemplate, Process: ConfigProcessData) {
        this.cfg.PrepareData = Process;
        this.cfg.SQL = sql;
        this.cfg.Template = Template;
    }
    setExecute(execute: () => void) {
        this.execute = execute;
    }
}