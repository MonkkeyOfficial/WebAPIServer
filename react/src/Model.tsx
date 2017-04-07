import { IExercice } from '../../process/entities/shared/IExercice'

export { APIResponse } from '../../process/entities/shared/APIResponse'

export { IExercice } from '../../process/entities/shared/IExercice'
export class Exercice extends IExercice
{
  constructor(data : any)
  {
    super()
    IExercice.copyTo(data, this)
    
    this.creation_date = new Date(this.creation_date);
    this.last_edit = new Date(this.last_edit);
  }
}
