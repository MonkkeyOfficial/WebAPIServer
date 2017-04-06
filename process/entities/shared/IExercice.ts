
export class IExercice
{
    // database
    id : number
    docker_key? : string
    docker_framework_id? : number | string
    
    creation_date : Date
    last_edit : Date
    last_compilation? : Date

    description? : string
    title? : string

    install_log? : string
    config? : string

    // computed
    configuration : any
    repositories : string[]
    
    static copyTo(data : any, obj : IExercice) : void
    {
        obj.docker_framework_id = data.docker_framework_id
        obj.last_compilation = data.last_compilation
        obj.creation_date = data.creation_date
        obj.description = data.description
        obj.install_log = data.install_log
        obj.docker_key = data.docker_key
        obj.last_edit = data.last_edit
        obj.config = data.config
        obj.title = data.title
        obj.id = data.id

        if(obj.config)
            obj.configuration = JSON.parse(obj.config);
    }
}
