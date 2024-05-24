import type { NextApiRequest, NextApiResponse } from 'next'
import { parseForm } from '~/lib/parseForm';
import { db } from '~/server/db';


export const config = {
  api: {
    bodyParser: false,
  }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fields, files } = await parseForm(req);

    console.log("files", files)

    await db.$transaction(async (v) => {
      for (const iterator of files!.media!) {
        await db.pembangunanMonitoringDokumentasi.create({
          data: {

            monitoringId: fields!.id![0] as string,
            url: iterator.newFilename
          }
        })
      }
    })

    res.status(200).json({ message: 'Berhasil upload photo' })
  } else {
    // Handle any other HTTP method
  }
}