import type {StringValue} from "ms";

const common = (min:number,max:number)=>{
    return {
        minLength: min,
        maxLength: max
    }
};

const Config = {
    Security: {
        auth_token:{
            access_token:{
                expiresIn: '3h' as StringValue
            },
            refresh_token:{
                maxAge: 7 * 24 * 60 * 60 * 1000,
                expiresIn: '7d' as StringValue
            }
        },
        password: {
            ...common(6,30),
            salt: 10,
        }
    },
    User: {
        username: { ...common(3,20) }
    },
    Album:{
        Categorys:{
            HolyCards:{
                Cards:{
                    index:{
                        minValue: 1,
                    },
                    title:{
                        ...common(3,50)
                    },
                    description:{
                        ...common(0,450)
                    },
                },
                dias:{
                    title:{
                        ...common(3,25)
                    },
                    hermandades:{
                        ...common(3,50)
                    }
                },
                hermandades:{
                    title:{
                        ...common(3,50)
                    },
                    cards:{
                        minValue: 1,
                    }
                }
            }
        },
        Metadata: {
            name:{
                ...common(4,50)
            },
            description:{
                ...common(0,200)
            },
        },

    }
}

export default Config