import {Button, Card, Flex, Image, Stack, Text} from "@mantine/core";
import {t} from "../util/i18n";
import React, {useState} from "react";
import {NewServiceModal} from "../components/NewServiceModal";
import {NewSecretModal} from "../components/NewSecretModal";
import {NewAlphabetModal} from "../components/NewAlphabetModal";

export function Shortcuts() {
  const [openCreateService, setOpenCreateService] = useState(false);
  const [openCreateSecret, setOpenCreateSecret] = useState(false);
  const [openCreateAlphabet, setOpenCreateAlphabet] = useState(false);

  return <Flex wrap="wrap" gap="xl" justify="center" className="shortcuts">
    <ShortcutCard
      image="/img/services.png"
      title={t("Services")}
      description={t("Services represent websites, apps or other things you want to store passwords for.")}
      buttonText={t("Create a new service")}
      onClick={() => setOpenCreateService(true)}
    />

    <NewServiceModal
      key="new-service"
      open={openCreateService}
      onClose={() => setOpenCreateService(false)}
    />

    <ShortcutCard
      image="/img/vault.png"
      title={t("Secrets")}
      description={t("Secrets represent passwords, keys or other sensitive information you want to store securely.")}
      buttonText={t("Create a new secret")}
      onClick={() => setOpenCreateSecret(true)}
    />

    <NewSecretModal
      key="new-secret"
      open={openCreateSecret}
      onClose={() => setOpenCreateSecret(false)}
    />

    <ShortcutCard
      image="/img/alphabets.png"
      title={t("Alphabets")}
      description={t("Alphabets represent the characters you want to use to generate passwords.")}
      buttonText={t("Create a new alphabet")}
      onClick={() => setOpenCreateAlphabet(true)}
    />

    <NewAlphabetModal
      key="new-alphabet"
      open={openCreateAlphabet}
      onClose={() => setOpenCreateAlphabet(false)}
    />
  </Flex>;
}

function ShortcutCard({title, description, image, buttonText, onClick}) {
  return <Card shadow="sm" padding="lg" radius="md" withBorder key="secret-card">
    <Card.Section>
      <Image
        src={image}
        height={160}
        alt={title}
      />
    </Card.Section>


    <Stack mt="md" spacing="xs" maw={250} mih={130}>
      <Text fw={500}>{title}</Text>

      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Stack>

    <Button
      color="blue"
      fullWidth
      mt="auto"
      radius="md"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  </Card>;
}
