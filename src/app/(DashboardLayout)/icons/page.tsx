'use client';
import PageContainer from '@/components/common/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const Icons = () => {
  return (
    <PageContainer title="Icons" description="this is Icons">
      <Card>
        <CardHeader>
          <CardTitle>Icons</CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            src="https://tabler-icons.io/"
            title="Tabler Icons"
            frameBorder={0}
            width="100%"
            height="650"
            className="rounded-lg"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Icons;
