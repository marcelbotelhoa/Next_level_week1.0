import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async index (req: Request, res: Response) {
        const { city, uf, itens } = req.query;

        const parsedItens = String(itens)
        .split(',')
        .map(item => Number(item.trim()))

    const points = await knex('points')
        .join('point_itens', 'points.id', '=', 'point_itens.point_id')
        .whereIn('point_itens.point_id', parsedItens)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');

        return res.json(points);
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;
        
        const point = await knex('points').where('id', id).first();

        if (!point) {
            return res.status(400).json({ message: 'Point not found.' })
        }

        const itens = await knex('itens')
        .join('point_itens', 'itens.id', '=', 'point_itens.item_id')
        .where('point_itens.point_id', id)
        .select('itens.title')

        return res.json({ point, itens});
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            itens
        } = req.body;
    
        const trx = await knex.transaction();

        const point = {
                image: 'image-fake',
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            }
    
        const insertedId = await trx('points').insert(point);
    
        const point_id = insertedId[0];
    
        const pointItens = itens.map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        })
        
        await trx('point_itens').insert(pointItens);

        await trx.commit();
    
        return res.json({
            id: point_id,
            ...point, 
        });
    }
};

export default PointsController;