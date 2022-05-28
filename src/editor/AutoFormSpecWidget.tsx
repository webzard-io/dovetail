import React, { useState, useEffect, useRef } from "react";
import {
  implementWidget,
  WidgetProps,
  isExpression,
  ExpressionWidget,
} from "@sunmao-ui/editor-sdk";
import {
  Modal,
  useDisclosure,
  Box,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { getApiBases, getResources, getResourceSpec } from "./remote-schema";
import JsonSchemaEditor from "@optum/json-schema-editor";

type Props = WidgetProps;

type SelectOption = { label: string; value: string };

export const AutoFormSpecWidget: React.FC<Props> = (props) => {
  const { value, services, onChange } = props;
  const spec = useRef<any>(
    isExpression(value) ? services.stateManager.maskedEval(value) : value
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [apiBaseOptions, setApiBaseOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    getApiBases().then((res) =>
      setApiBaseOptions(res.map((v) => ({ label: v, value: v })))
    );
  }, []);
  const [filter, setFilter] = useState<{
    base: SelectOption | null;
    def: SelectOption | null;
  }>({
    base: null,
    def: null,
  });
  const [resourceDefOptions, setResourceDefOptions] = useState<SelectOption[]>(
    []
  );
  useEffect(() => {
    if (!filter.base?.value) {
      return;
    }
    getResources(filter.base.value).then((defs) =>
      setResourceDefOptions(defs.map((v) => ({ label: v, value: v })))
    );
  }, [filter.base]);
  const [addKey, setAddKey] = useState("");
  const [forceKey, setForceKey] = useState(0);

  return (
    <Box>
      <Button onClick={onOpen} size="sm" variant="outline" mb={1}>
        Form Spec Designer
      </Button>
      {!isOpen && (
        <ExpressionWidget
          {...props}
          onChange={(newValue) => {
            spec.current = newValue;
            onChange(newValue);
          }}
        />
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        closeOnEsc={false}
        trapFocus={false}
      >
        <ModalOverlay />
        <ModalContent height="100%">
          <ModalHeader>Edit Form Spec</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="auto">
            {isOpen && (
              <Box>
                <Box display="flex">
                  <Box width="350px">
                    <Select
                      value={filter.base}
                      onChange={(newValue) =>
                        setFilter((prev) => ({
                          ...prev,
                          base: newValue,
                        }))
                      }
                      options={apiBaseOptions}
                      size="sm"
                    />
                  </Box>
                  <Box width="350px" ml={2}>
                    <Select
                      value={filter.def}
                      onChange={(newValue) =>
                        setFilter((prev) => ({
                          ...prev,
                          def: newValue,
                        }))
                      }
                      options={resourceDefOptions}
                      size="sm"
                    />
                  </Box>
                  <Input
                    size="sm"
                    width="100px"
                    placeholder="key"
                    ml={2}
                    value={addKey}
                    onChange={(evt) => setAddKey(evt.currentTarget.value)}
                  />
                  <Button
                    size="sm"
                    ml={2}
                    colorScheme="blue"
                    disabled={!addKey || !filter.def?.value}
                    onClick={async () => {
                      const resourceSpec = await getResourceSpec(
                        filter.def!.value
                      );
                      if (
                        !spec.current.properties ||
                        spec.current.type !== "object"
                      ) {
                        spec.current.type = "object";
                        spec.current.properties = {};
                      }
                      spec.current.properties[addKey] = resourceSpec;
                      setForceKey(forceKey + 1);
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <JsonSchemaEditor
                  key={forceKey}
                  data={spec.current}
                  onSchemaChange={(s) => {
                    if (s === JSON.stringify(spec.current)) {
                      return;
                    }
                    spec.current = JSON.parse(s);
                  }}
                />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => {
                onChange(spec.current);
                onClose();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "AutoFormSpecWidget",
  },
})(AutoFormSpecWidget);
