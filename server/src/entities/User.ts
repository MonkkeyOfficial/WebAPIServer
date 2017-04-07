
export class User
{
    id : number
    name : string
    password_hash : string
    email : string
    creation_date : Date
    last_edit_date : Date

    static fromDB(data : any) : User
    {
        var obj = new User()

        obj.last_edit_date = data.last_edit_date
        obj.password_hash = data.password_hash
        obj.creation_date = data.creation_date
        obj.email = data.email
        obj.name = data.name
        obj.id = data.id

        return obj;
    }
}
