export enum Language_enum {
    BLANK = "UNKNOW",
    ES = "es",
    FR = "fr"
}

export type Language = `${Language_enum}`;

export enum Country_enum{
    BLANK = "UNKNOW",
    SPAIN = "es",
    FRANCE = "fr"
}

export type Country = `${Country_enum}`

export enum Publisher_enum{
    BLANK = "UNKNOW",
    TEST = "Test_publisher",
    HOLY_CARDS = "Holy Cards",
    PANINI = "Panini",
}

export type Publsher = `${Publisher_enum}`

export enum AlbumType_enum{
    BLANK = "UNKNOW",
    FOOTBALL = "Football",
    HOLY_WEEK = "Holy Week",
}

export type Album_Type = `${AlbumType_enum}`